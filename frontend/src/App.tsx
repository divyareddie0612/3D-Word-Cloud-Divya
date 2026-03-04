import { useState, Suspense } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import WordCloud3D from "./components/canvas/WordCloud3D.tsx";
import { Loader2, Globe, Sparkles } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface WordCloudItem {
  text: string;
  value: number;
}

interface AnalyzeResponse {
  words: WordCloudItem[];
  article_title: string;
}

// Sample demo data
const DEMO_WORDS: WordCloudItem[] = [
  { text: "React", value: 100 },
  { text: "ThreeJS", value: 90 },
  { text: "Fiber", value: 85 },
  { text: "Creative", value: 80 },
  { text: "Code", value: 75 },
  { text: "Future", value: 70 },
  { text: "Data", value: 65 },
  { text: "Visual", value: 60 },
  { text: "Interactive", value: 55 },
  { text: "Design", value: 50 },
  { text: "Innovation", value: 45 },
  { text: "Technology", value: 40 },
];

// Sample article URLs
const SAMPLE_URLS = [
  "https://www.bbc.com/news/technology",
  "https://techcrunch.com/2025/01/15/ai-breakthrough/",
  "https://www.wired.com/story/artificial-intelligence/",
  "https://www.nytimes.com/section/technology",
];

function App() {
  const [url, setUrl] = useState("");
  const [words, setWords] = useState<WordCloudItem[]>(DEMO_WORDS);
  const [articleTitle, setArticleTitle] = useState("Demo Word Cloud");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const analyzeArticle = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post<AnalyzeResponse>(`${API}/analyze`, {
        url: url.trim(),
      });

      setWords(response.data.words);
      setArticleTitle(response.data.article_title || "Article Analysis");
      setHasAnalyzed(true);
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.detail || "Failed to analyze article. Please check the URL and try again.";
      setError(errorMsg);
      console.error("Error analyzing article:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError("");
  };

  const handleReset = () => {
    setWords(DEMO_WORDS);
    setArticleTitle("Demo Word Cloud");
    setUrl("");
    setError("");
    setHasAnalyzed(false);
  };

  return (
    <div className="app-container" data-testid="app-container">
      {/* 3D Canvas Background */}
      <Canvas
        camera={{ position: [0, 0, 30], fov: 75 }}
        className="fixed inset-0 -z-10"
      >
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 0, 80]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#00f3ff" intensity={0.8} />
        <pointLight position={[-10, -10, -10]} color="#7000ff" intensity={0.6} />
        
        <Suspense fallback={null}>
          <WordCloud3D words={words} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="ui-overlay" data-testid="ui-overlay">
        {/* Header */}
        <motion.div
          className="header-section"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-cyan-400" />
            <h1 className="title" data-testid="app-title">
              NEXUS CLOUD
            </h1>
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="subtitle" data-testid="app-subtitle">
            3D Article Topic Visualization
          </p>
        </motion.div>

        {/* Article Title Display */}
        <AnimatePresence>
          {hasAnalyzed && (
            <motion.div
              className="article-title-display"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              data-testid="article-title-display"
            >
              <span className="article-label">ANALYZING:</span>
              <span className="article-name">{articleTitle}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section */}
        <motion.div
          className="input-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="input-wrapper" data-testid="url-input-wrapper">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzeArticle()}
              placeholder="Enter article URL to analyze..."
              className="url-input"
              disabled={loading}
              data-testid="url-input"
            />
            <div className="input-glow" />
          </div>

          <div className="button-group">
            <button
              onClick={analyzeArticle}
              disabled={loading || !url.trim()}
              className="analyze-button"
              data-testid="analyze-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  DECRYPTING...
                </>
              ) : (
                "ANALYZE"
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="reset-button"
              data-testid="reset-button"
            >
              RESET
            </button>
          </div>

          {/* Sample URLs */}
          <div className="samples-section" data-testid="samples-section">
            <span className="samples-label">SAMPLE ARTICLES:</span>
            <div className="samples-grid">
              {SAMPLE_URLS.map((sampleUrl, idx) => {
                let displayName = sampleUrl;
                try {
                  displayName = new URL(sampleUrl).hostname.replace("www.", "");
                } catch (e) {
                  displayName = sampleUrl;
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(sampleUrl)}
                    className="sample-button"
                    disabled={loading}
                    data-testid={`sample-button-${idx}`}
                  >
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-display"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              data-testid="error-display"
            >
              <div className="error-content">
                <span className="error-label">SYSTEM FAILURE</span>
                <span className="error-message">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          className="instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          data-testid="instructions"
        >
          <p>Drag to rotate • Scroll to zoom • Hover to highlight</p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
