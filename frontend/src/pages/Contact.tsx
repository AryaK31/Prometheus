import React, { useState } from "react";
import "./Contact.css";

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend endpoint
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-subtitle">
          Have questions or feedback? We'd love to hear from you!
        </p>

        <div className="contact-grid">
          <div className="contact-form-section">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>
              <button type="submit" className="submit-button">
                {submitted ? "Message Sent! ✓" : "Send Message"}
              </button>
            </form>
          </div>

          <div className="contact-info-section">
            <div className="info-card">
              <h3>📧 Email</h3>
              <p>support@harvesthelper.ai</p>
            </div>
            <div className="info-card">
              <h3>🌐 Website</h3>
              <p>www.harvesthelper.ai</p>
            </div>
            <div className="info-card">
              <h3>💬 Support</h3>
              <p>Available 24/7 via chat</p>
            </div>
            <div className="info-card">
              <h3>📱 Social Media</h3>
              <div className="social-links">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
