import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🌾</span>
        <span className="navbar-title">Prometheus</span>
      </div>
      <div className="navbar-links">
        <Link
          to="/"
          className={`navbar-link ${isActive("/") ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/chat"
          className={`navbar-link ${isActive("/chat") ? "active" : ""}`}
        >
          Chat
        </Link>
        <Link
          to="/plan-season"
          className={`navbar-link ${isActive("/plan-season") ? "active" : ""}`}
        >
          Plan Season
        </Link>
        <Link
          to="/farm-profile"
          className={`navbar-link ${isActive("/farm-profile") ? "active" : ""}`}
        >
          Farm Profile
        </Link>
        <Link
          to="/pest-check"
          className={`navbar-link ${isActive("/pest-check") ? "active" : ""}`}
        >
          Pest Check
        </Link>
        <Link
          to="/about"
          className={`navbar-link ${isActive("/about") ? "active" : ""}`}
        >
          About
        </Link>
        <Link
          to="/contact"
          className={`navbar-link ${isActive("/contact") ? "active" : ""}`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
};
