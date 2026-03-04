# 3D Word Cloud Visualization

An interactive 3D word cloud generator that visualizes topics from news articles using React Three Fiber and FastAPI.

## 🎨 Features

- **3D Interactive Visualization**: Words float in 3D space with spherical distribution
- **Article Analysis**: Extracts and analyzes text from any news article URL
- **Topic Modeling**: Uses TF-IDF for keyword extraction and topic analysis
- **Cyber-Void Design**: Futuristic dark theme with neon accents
- **Real-time Interaction**: Drag to rotate, scroll to zoom, hover to highlight words
- **Demo Mode**: Pre-loaded demo word cloud on initial load

## 🛠️ Tech Stack

### Frontend
- **React** (TypeScript)
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Framer Motion** - UI animations
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **Trafilatura** - Article text extraction
- **scikit-learn** - TF-IDF vectorization
- **NLTK** - Natural language processing (stopwords)
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation

## 📋 Prerequisites

- **macOS** (setup script is designed for macOS)
- **Python 3.8+**
- **Node.js 14+**
- **Yarn** (will be installed automatically if missing)

## 🚀 Quick Start

### Option 1: Using Setup Script (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 3D-Word-Cloud-Divya
   ```

2. **Make setup script executable**
   ```bash
   chmod +x setup.sh
   ```

3. **Run setup script**
   ```bash
   ./setup.sh
   ```

   The script will:
   - Install all backend dependencies (Python packages)
   - Install all frontend dependencies (Node packages)
   - Download NLTK stopwords data
   - Start both servers concurrently

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download NLTK data**
   ```bash
   python3 -c "import nltk; nltk.download('stopwords')"
   ```

5. **Start backend server**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

#### Frontend Setup

1. **Open new terminal and navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   yarn install --ignore-engines
   ```

3. **Start frontend server**
   ```bash
   yarn start
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage

1. **Demo Mode**: On initial load, a demo word cloud with tech-related terms is displayed

2. **Analyze Article**:
   - Enter any article URL in the input field
   - Click "ANALYZE" or press Enter
   - Wait for the analysis to complete ("DECRYPTING...")
   - The 3D word cloud will update with extracted topics

3. **Sample Articles**: Click on any sample article button to quickly load a pre-defined URL

4. **Interact with 3D Scene**:
   - **Drag**: Rotate the word cloud
   - **Scroll**: Zoom in/out
   - **Hover**: Highlight individual words (scale up + glow effect)

5. **Reset**: Click "RESET" to return to demo mode

## 🎯 API Endpoints

### `POST /api/analyze`

Analyze an article URL and return word cloud data.

**Request Body**:
```json
{
  "url": "https://example.com/article"
}
```

**Response**:
```json
{
  "words": [
    {"text": "Technology", "value": 95.5},
    {"text": "Innovation", "value": 87.3},
    ...
  ],
  "article_title": "Article Title Here"
}
```

### `GET /api/`

Health check endpoint.

**Response**:
```json
{"message": "Hello World"}
```

## 🏗️ Project Structure

```
.
├── setup.sh                 # Setup script for macOS
├── README.md               # This file
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
└── frontend/
    ├── src/
    │   ├── App.tsx           # Main React component
    │   ├── App.css           # Cyber-Void styles
    │   ├── index.js          # React entry point
    │   └── components/
    │       └── canvas/
    │           ├── WordCloud3D.tsx   # 3D word cloud container
    │           └── Word3D.tsx        # Individual 3D word component
    ├── package.json       # Node dependencies
    └── public/           # Static assets
```

## 🔬 How It Works

### Backend Analysis Pipeline

1. **Fetch Article**: Uses Trafilatura to download and extract article text from URL
2. **Clean Text**: Removes special characters, digits, and converts to lowercase
3. **Remove Stopwords**: Filters out common English words using NLTK
4. **TF-IDF Analysis**: Applies TF-IDF vectorization to identify important terms
   - Extracts top 50 features
   - Supports unigrams and bigrams
   - Filters by document frequency
5. **Normalize Scores**: Scales word scores to 20-100 range for visualization
6. **Fallback**: If TF-IDF fails, uses simple word frequency counting

### Frontend 3D Rendering

1. **Spherical Distribution**: Words are positioned using spherical coordinates
2. **Size Mapping**: Word importance (value) maps to font size (0.3-1.5)
3. **Color Gradient**: Words interpolate between purple and cyan based on importance
4. **Billboard Effect**: Text always faces the camera for readability
5. **Hover Animation**: Smooth scale-up and color change on hover
6. **Auto-rotation**: Gentle continuous rotation of the word cloud

## 🎨 Design System

- **Theme**: Cyber-Void aesthetic with dark backgrounds
- **Colors**:
  - Primary: Neon Cyan (#00f3ff)
  - Secondary: Purple (#7000ff)
  - Background: Pure Black (#050505)
- **Typography**:
  - Headings: Orbitron (sci-fi)
  - Body: Rajdhani
  - Code: JetBrains Mono
- **Effects**: Glassmorphism, neon glow, glitch animations

## 🐛 Troubleshooting

### Backend Issues

- **Port 8001 already in use**: Kill existing process or change port
  ```bash
  lsof -ti:8001 | xargs kill -9
  ```

- **NLTK data not found**: Manually download stopwords
  ```bash
  python3 -c "import nltk; nltk.download('stopwords')"
  ```

### Frontend Issues

- **Port 3000 already in use**: Kill existing process or change port
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

- **Module not found errors**: Clear cache and reinstall
  ```bash
  rm -rf node_modules yarn.lock
  yarn install --ignore-engines
  ```

### Analysis Issues

- **"Unable to fetch article"**: URL might be blocked, paywalled, or invalid
- **"Could not extract meaningful text"**: Article might be too short or have unusual formatting
- **Empty word cloud**: Try a different article with more substantial content

## 📝 Notes

- **Sample URLs**: Some sample URLs may not work due to paywalls or geo-restrictions
- **CORS**: Backend is configured to accept requests from any origin
- **Performance**: Optimized for <100 words. Larger datasets may impact performance
- **Browser Support**: Works best in modern browsers (Chrome, Firefox, Safari, Edge)

## 🔮 Future Enhancements

- Export word cloud as image or video
- Custom color schemes
- Multiple visualization layouts (sphere, cube, spiral)
- Real-time collaborative mode
- Sentiment analysis integration
- Language detection and multi-language support

## 📄 License

MIT License - Feel free to use this project for learning and development.

## 👤 Author

Divya

---

**Note**: This project was created as part of a technical assessment to demonstrate full-stack development skills, 3D visualization capabilities, and NLP integration.
