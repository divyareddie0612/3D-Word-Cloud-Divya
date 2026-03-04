from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import trafilatura
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import nltk
from collections import Counter

# Download NLTK stopwords if not already present
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

from nltk.corpus import stopwords

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class AnalyzeRequest(BaseModel):
    url: str

class WordCloudItem(BaseModel):
    text: str
    value: float

class AnalyzeResponse(BaseModel):
    words: List[WordCloudItem]
    article_title: str = ""

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_article(request: AnalyzeRequest):
    """
    Analyze an article URL and return word cloud data with topic modeling
    """
    try:
        # Validate URL is not empty
        if not request.url or not request.url.strip():
            raise HTTPException(status_code=422, detail="URL cannot be empty")
        
        # Fetch article text using trafilatura
        downloaded = trafilatura.fetch_url(request.url)
        if not downloaded:
            raise HTTPException(status_code=400, detail="Unable to fetch the article. Please check the URL.")
        
        # Extract text and metadata
        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        metadata = trafilatura.extract_metadata(downloaded)
        
        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract meaningful text from the article.")
        
        article_title = metadata.title if metadata and metadata.title else "Untitled Article"
        
        # Text preprocessing
        # Remove special characters and digits, keep only letters
        text_clean = re.sub(r'[^a-zA-Z\s]', '', text.lower())
        
        # Get English stopwords
        stop_words = set(stopwords.words('english'))
        
        # Add common words that don't add value
        stop_words.update(['said', 'says', 'also', 'would', 'could', 'may', 'might', 
                          'one', 'two', 'three', 'like', 'get', 'got', 'going', 'go',
                          'make', 'made', 'way', 'new', 'first', 'last', 'year', 'years'])
        
        # TF-IDF Vectorization
        vectorizer = TfidfVectorizer(
            max_features=50,  # Top 50 words
            stop_words=list(stop_words),
            ngram_range=(1, 2),  # Include single words and bigrams
            min_df=2,  # Word must appear at least twice
            max_df=0.8  # Ignore words that appear in more than 80% of documents
        )
        
        try:
            tfidf_matrix = vectorizer.fit_transform([text_clean])
            feature_names = vectorizer.get_feature_names_out()
            scores = tfidf_matrix.toarray()[0]
            
            # Create word-score pairs
            word_scores = [(feature_names[i], scores[i]) for i in range(len(feature_names)) if scores[i] > 0]
            word_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Take top 30 words for visualization
            top_words = word_scores[:30]
            
            # Normalize scores to a range suitable for visualization (1-100)
            if top_words:
                max_score = top_words[0][1]
                min_score = top_words[-1][1] if len(top_words) > 1 else 0
                score_range = max_score - min_score if max_score != min_score else 1
                
                words = [
                    WordCloudItem(
                        text=word.replace(' ', '_').title() if ' ' in word else word.title(),
                        value=20 + ((score - min_score) / score_range) * 80  # Scale to 20-100
                    )
                    for word, score in top_words
                ]
            else:
                # Fallback if TF-IDF doesn't produce results
                words = get_fallback_keywords(text_clean, stop_words)
            
        except Exception as e:
            logging.warning(f"TF-IDF failed: {e}. Using fallback keyword extraction.")
            words = get_fallback_keywords(text_clean, stop_words)
        
        if not words:
            raise HTTPException(status_code=400, detail="Could not extract keywords from the article.")
        
        return AnalyzeResponse(words=words, article_title=article_title)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error analyzing article: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing article: {str(e)}")

def get_fallback_keywords(text: str, stop_words: set) -> List[WordCloudItem]:
    """
    Fallback method using simple word frequency when TF-IDF fails
    """
    words = text.split()
    words = [w for w in words if len(w) > 3 and w not in stop_words]
    
    word_freq = Counter(words)
    top_words = word_freq.most_common(30)
    
    if not top_words:
        return []
    
    max_freq = top_words[0][1]
    min_freq = top_words[-1][1] if len(top_words) > 1 else 1
    freq_range = max_freq - min_freq if max_freq != min_freq else 1
    
    return [
        WordCloudItem(
            text=word.title(),
            value=20 + ((freq - min_freq) / freq_range) * 80
        )
        for word, freq in top_words
    ]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
