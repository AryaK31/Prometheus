import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Chat } from "./pages/Chat";
import { PlanSeason } from "./pages/PlanSeason";
import { FarmProfile } from "./pages/FarmProfile";
import { PestCheck } from "./pages/PestCheck";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import "./styles.css";

export type Role = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: string;
}

export interface FarmerProfile {
  name?: string;
  location?: string;
  primaryCrops?: string;
  notes?: string;
}

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/plan-season" element={<PlanSeason />} />
          <Route path="/farm-profile" element={<FarmProfile />} />
          <Route path="/pest-check" element={<PestCheck />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
