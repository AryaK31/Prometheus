import React from "react";
import "./About.css";

export const About: React.FC = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Prometheus</h1>
        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              Prometheus is an AI-powered agricultural assistant designed to help farmers
              optimize crop yields, manage resources efficiently, and make data-driven decisions.
              We combine cutting-edge AI technology with practical farming knowledge to provide
              actionable insights tailored to your specific farm.
            </p>
          </section>

          <section className="about-section">
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <h3>🌾 Farm Digital Twin</h3>
                <p>
                  Build a comprehensive digital representation of your farm with 3D visualization,
                  tracking fields, crops, soil types, and irrigation systems.
                </p>
              </div>
              <div className="feature-item">
                <h3>📅 Multi-Objective Planning</h3>
                <p>
                  Optimize your seasonal plans balancing yield, profit, water conservation, and
                  risk reduction with AI-powered decision support.
                </p>
              </div>
              <div className="feature-item">
                <h3>🔍 Pest & Disease Detection</h3>
                <p>
                  Upload images or use drone feeds to identify plant health issues instantly,
                  with treatment recommendations.
                </p>
              </div>
              <div className="feature-item">
                <h3>💬 AI Chat Assistant</h3>
                <p>
                  Get instant answers to your farming questions with voice and text support,
                  powered by advanced language models.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Technology</h2>
            <p>
              Prometheus is built using modern web technologies and AI frameworks:
            </p>
            <ul className="tech-list">
              <li>LangChain for AI orchestration</li>
              <li>Llama 3.3 for natural language understanding</li>
              <li>Three.js for 3D farm visualization</li>
              <li>React for responsive user interface</li>
              <li>FastAPI for robust backend services</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Research & Innovation</h2>
            <p>
              Prometheus incorporates novel research in multi-objective optimization,
              digital twin technology, and AI-driven agricultural decision support. Our system
              combines farm-level state management with conversational AI to provide personalized
              recommendations that adapt to your specific context.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
