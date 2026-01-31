import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export const Home: React.FC = () => {
  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">Welcome to Prometheus</h1>
        <p className="home-subtitle">
          Your AI-powered agricultural assistant for smarter farming decisions
        </p>
        <div className="home-actions">
          <Link to="/chat" className="home-button primary">
            Start Chatting
          </Link>
          <Link to="/plan-season" className="home-button secondary">
            Plan Your Season
          </Link>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3>AI Chat Assistant</h3>
          <p>
            Get instant answers to your farming questions with voice and text
            support
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Season Planning</h3>
          <p>
            Multi-objective optimization for irrigation, fertilization, and crop
            management
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌾</div>
          <h3>Farm Digital Twin</h3>
          <p>
            Visualize your farm in 3D and track fields, crops, and resources
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Pest & Disease Detection</h3>
          <p>
            Upload images or use drone feeds to identify plant health issues
            instantly
          </p>
        </div>
      </div>
    </div>
  );
};
