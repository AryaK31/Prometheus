import React, { useState, useRef } from "react";
import "./PestCheck.css";

const createSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const PestCheck: React.FC = () => {
  const [sessionId] = useState<string>(createSessionId);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [crop, setCrop] = useState("");
  const [description, setDescription] = useState("");
  const [results, setResults] = useState<Array<{ file: string; diagnosis: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [droneFeedActive, setDroneFeedActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    setLoading(true);
    const newResults: Array<{ file: string; diagnosis: string }> = [];

    for (const file of selectedFiles) {
      const imageReference = `${Date.now()}-${file.name}`;
      try {
        const res = await fetch("/api/image-diagnosis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            image_reference: imageReference,
            crop: crop || undefined,
            description: description || undefined
          })
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = (await res.json()) as { diagnosis: string };
        newResults.push({ file: file.name, diagnosis: data.diagnosis });
      } catch (err) {
        newResults.push({
          file: file.name,
          diagnosis: "Failed to analyze this image. Please try again."
        });
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const toggleDroneFeed = () => {
    setDroneFeedActive(!droneFeedActive);
  };

  return (
    <div className="pest-check-page">
      <div className="pest-check-container">
        <h1>Pest & Disease Detection</h1>
        <p className="pest-subtitle">
          Upload multiple images or use live drone feed for continuous monitoring
        </p>

        <div className="pest-check-grid">
          <div className="pest-check-main">
            <div className="pest-section">
              <h3>Image Input</h3>
              <div className="input-methods">
                <div className="method-card">
                  <h4>📷 Camera Upload</h4>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input-hidden"
                  />
                  <button
                    className="method-button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Multiple Images
                  </button>
                  {selectedFiles.length > 0 && (
                    <div className="file-list">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name}</span>
                          <button
                            className="remove-file-button"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="method-card">
                  <h4>🚁 Drone Feed</h4>
                  <button
                    className={`method-button ${droneFeedActive ? "active" : ""}`}
                    onClick={toggleDroneFeed}
                  >
                    {droneFeedActive ? "Stop Live Feed" : "Start Live Feed"}
                  </button>
                  {droneFeedActive && (
                    <div className="drone-feed-preview">
                      <div className="drone-feed-placeholder">
                        <p>🛸 Live Drone Feed</p>
                        <p className="feed-note">
                          Simulated feed. In production, this would connect to your drone's camera stream.
                        </p>
                        <div className="feed-controls">
                          <button
                            className="capture-button"
                            onClick={() => {
                              alert("Image captured from drone feed!");
                            }}
                          >
                            Capture Image
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pest-section">
              <h3>Context Information</h3>
              <div className="context-fields">
                <div className="form-field">
                  <label>Crop Type</label>
                  <input
                    type="text"
                    value={crop}
                    onChange={e => setCrop(e.target.value)}
                    placeholder="e.g., Tomatoes, Corn"
                  />
                </div>
                <div className="form-field">
                  <label>Description of Symptoms</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Yellow spots on lower leaves, wilting..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={loading || selectedFiles.length === 0}
            >
              {loading ? "Analyzing..." : `Analyze ${selectedFiles.length} Image(s)`}
            </button>

            {results.length > 0 && (
              <div className="pest-results">
                <h3>Analysis Results</h3>
                {results.map((result, index) => (
                  <div key={index} className="result-card">
                    <h4>{result.file}</h4>
                    <p>{result.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pest-sidebar">
            <div className="info-card">
              <h4>💡 Tips</h4>
              <ul>
                <li>Take clear, well-lit photos of affected areas</li>
                <li>Include multiple angles if possible</li>
                <li>Upload images of both healthy and affected plants for comparison</li>
                <li>Use drone feed for large-scale field monitoring</li>
              </ul>
            </div>
            <div className="info-card">
              <h4>🔍 What We Detect</h4>
              <ul>
                <li>Common pests (aphids, mites, etc.)</li>
                <li>Fungal diseases</li>
                <li>Bacterial infections</li>
                <li>Nutrient deficiencies</li>
                <li>Environmental stress</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
