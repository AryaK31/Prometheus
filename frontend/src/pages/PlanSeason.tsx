import React, { useState, useEffect } from "react";
import { SidebarProfile } from "../components/SidebarProfile";
import type { FarmerProfile } from "../App";
import "./PlanSeason.css";

const createSessionId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const PlanSeason: React.FC = () => {
  const [sessionId] = useState<string>(createSessionId);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>({});
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [objectives, setObjectives] = useState({
    weight_yield: 0.4,
    weight_profit: 0.3,
    weight_water_saving: 0.2,
    weight_risk_reduction: 0.1
  });
  const [constraints, setConstraints] = useState({
    max_water_mm: "",
    max_nitrogen_kg_ha: "",
    max_budget_usd: "",
    risk_tolerance: "medium"
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [cropSuggestions, setCropSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [season, setSeason] = useState("spring");

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const profilePayload = {
        name: farmerProfile.name || undefined,
        location: farmerProfile.location || undefined,
        primary_crops: farmerProfile.primaryCrops
          ? farmerProfile.primaryCrops.split(",").map(c => c.trim())
          : undefined,
        notes: farmerProfile.notes || undefined
      };

      const res = await fetch("/api/decision-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          scenario_description: scenarioDescription || undefined,
          farmer_profile: profilePayload,
          objectives: {
            weight_yield: objectives.weight_yield,
            weight_profit: objectives.weight_profit,
            weight_water_saving: objectives.weight_water_saving,
            weight_risk_reduction: objectives.weight_risk_reduction
          },
          constraints: {
            max_water_mm: constraints.max_water_mm ? parseFloat(constraints.max_water_mm) : null,
            max_nitrogen_kg_ha: constraints.max_nitrogen_kg_ha ? parseFloat(constraints.max_nitrogen_kg_ha) : null,
            max_budget_usd: constraints.max_budget_usd ? parseFloat(constraints.max_budget_usd) : null,
            risk_tolerance: constraints.risk_tolerance
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Failed to generate plan. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const normalizeWeights = () => {
    const total = objectives.weight_yield + objectives.weight_profit + objectives.weight_water_saving + objectives.weight_risk_reduction;
    if (total > 0) {
      setObjectives({
        weight_yield: objectives.weight_yield / total,
        weight_profit: objectives.weight_profit / total,
        weight_water_saving: objectives.weight_water_saving / total,
        weight_risk_reduction: objectives.weight_risk_reduction / total
      });
    }
  };

  const fetchCropSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const soilType = farmerProfile.notes?.toLowerCase().includes("soil") 
        ? farmerProfile.notes.split("soil")[1]?.split(" ")[1] || "loam"
        : "loam";
      
      const res = await fetch("/api/crop-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: farmerProfile.location || undefined,
          soil_type: soilType,
          season: season
        })
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      setCropSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed to fetch crop suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  React.useEffect(() => {
    if (farmerProfile.location) {
      fetchCropSuggestions();
    }
  }, [farmerProfile.location, season]);

  return (
    <div className="plan-season-page">
      <div className="plan-season-container">
        <div className="plan-season-sidebar">
          <h2>Farm Profile</h2>
          <SidebarProfile profile={farmerProfile} onChange={setFarmerProfile} />
        </div>

        <div className="plan-season-main">
          <h1>Plan Your Planting Season</h1>
          <p className="plan-subtitle">
            Set your priorities and constraints to get optimized management plans
          </p>

          <div className="plan-section">
            <h3>Season Selection</h3>
            <div className="season-selector">
              <button
                className={`season-button ${season === "spring" ? "active" : ""}`}
                onClick={() => setSeason("spring")}
              >
                Spring
              </button>
              <button
                className={`season-button ${season === "summer" ? "active" : ""}`}
                onClick={() => setSeason("summer")}
              >
                Summer
              </button>
              <button
                className={`season-button ${season === "all" ? "active" : ""}`}
                onClick={() => setSeason("all")}
              >
                All Seasons
              </button>
            </div>
          </div>

          <div className="plan-section">
            <h3>🌾 Crop Suggestions</h3>
            {loadingSuggestions ? (
              <p>Loading crop suggestions...</p>
            ) : cropSuggestions.length > 0 ? (
              <div className="crop-suggestions-grid">
                {cropSuggestions.map((crop, index) => (
                  <div key={index} className="crop-suggestion-card">
                    <h4>{crop.crop_name}</h4>
                    <div className="crop-details">
                      <div className="crop-detail-item">
                        <strong>📅 Planting:</strong> {crop.planting_date}
                      </div>
                      <div className="crop-detail-item">
                        <strong>🌾 Harvest:</strong> {crop.harvest_date}
                      </div>
                      <div className="crop-detail-item">
                        <strong>💧 Irrigation:</strong> {crop.irrigation_schedule}
                      </div>
                      <div className="crop-detail-item">
                        <strong>🧪 Fertilizer:</strong> {crop.fertilizer_recommendation}
                      </div>
                      <div className="crop-detail-item">
                        <strong>📊 Expected Yield:</strong> {crop.expected_yield_per_ha}
                      </div>
                      <div className="crop-detail-item">
                        <strong>💡 Notes:</strong> {crop.notes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="plan-help">Enter your location in the farm profile to get crop suggestions.</p>
            )}
          </div>

          <div className="plan-section">
            <h3>Scenario Description</h3>
            <textarea
              className="plan-textarea"
              placeholder="Describe your upcoming season, goals, or any specific concerns..."
              value={scenarioDescription}
              onChange={e => setScenarioDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="plan-section">
            <h3>Objective Preferences</h3>
            <p className="plan-help">Adjust sliders to prioritize what matters most (total will auto-normalize)</p>
            <div className="slider-group">
              <label>
                Yield: {Math.round(objectives.weight_yield * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={objectives.weight_yield}
                  onChange={e => {
                    setObjectives({ ...objectives, weight_yield: parseFloat(e.target.value) });
                    setTimeout(normalizeWeights, 100);
                  }}
                />
              </label>
              <label>
                Profit: {Math.round(objectives.weight_profit * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={objectives.weight_profit}
                  onChange={e => {
                    setObjectives({ ...objectives, weight_profit: parseFloat(e.target.value) });
                    setTimeout(normalizeWeights, 100);
                  }}
                />
              </label>
              <label>
                Water Saving: {Math.round(objectives.weight_water_saving * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={objectives.weight_water_saving}
                  onChange={e => {
                    setObjectives({ ...objectives, weight_water_saving: parseFloat(e.target.value) });
                    setTimeout(normalizeWeights, 100);
                  }}
                />
              </label>
              <label>
                Risk Reduction: {Math.round(objectives.weight_risk_reduction * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={objectives.weight_risk_reduction}
                  onChange={e => {
                    setObjectives({ ...objectives, weight_risk_reduction: parseFloat(e.target.value) });
                    setTimeout(normalizeWeights, 100);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="plan-section">
            <h3>Resource Constraints</h3>
            <div className="constraints-grid">
              <div className="constraint-field">
                <label>Max Water (mm)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={constraints.max_water_mm}
                  onChange={e => setConstraints({ ...constraints, max_water_mm: e.target.value })}
                />
              </div>
              <div className="constraint-field">
                <label>Max Nitrogen (kg/ha)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={constraints.max_nitrogen_kg_ha}
                  onChange={e => setConstraints({ ...constraints, max_nitrogen_kg_ha: e.target.value })}
                />
              </div>
              <div className="constraint-field">
                <label>Max Budget (USD)</label>
                <input
                  type="number"
                  placeholder="Optional"
                  value={constraints.max_budget_usd}
                  onChange={e => setConstraints({ ...constraints, max_budget_usd: e.target.value })}
                />
              </div>
              <div className="constraint-field">
                <label>Risk Tolerance</label>
                <select
                  value={constraints.risk_tolerance}
                  onChange={e => setConstraints({ ...constraints, risk_tolerance: e.target.value })}
                >
                  <option value="low">Low (Conservative)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Aggressive)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            className="plan-optimize-button"
            onClick={handleOptimize}
            disabled={loading}
          >
            {loading ? "Generating Plan..." : "Generate Optimized Plan"}
          </button>

          {result && (
            <div className="plan-results">
              <h3>Recommended Plan</h3>
              <div className="plan-card best">
                <h4>⭐ {result.best_plan.name}</h4>
                <p>{result.best_plan.description}</p>
                <div className="plan-metrics">
                  <span>Yield: {Math.round(result.best_plan.expected_yield_index * 100)}%</span>
                  <span>Profit: {Math.round(result.best_plan.expected_profit_index * 100)}%</span>
                  <span>Water Use: {Math.round(result.best_plan.water_use_index * 100)}%</span>
                  <span>Risk: {Math.round(result.best_plan.risk_index * 100)}%</span>
                </div>
              </div>

              <h3>Alternative Plan</h3>
              <div className="plan-card alternative">
                <h4>{result.alternative_plan.name}</h4>
                <p>{result.alternative_plan.description}</p>
                <div className="plan-metrics">
                  <span>Yield: {Math.round(result.alternative_plan.expected_yield_index * 100)}%</span>
                  <span>Profit: {Math.round(result.alternative_plan.expected_profit_index * 100)}%</span>
                  <span>Water Use: {Math.round(result.alternative_plan.water_use_index * 100)}%</span>
                  <span>Risk: {Math.round(result.alternative_plan.risk_index * 100)}%</span>
                </div>
              </div>

              <div className="plan-explanation">
                <h4>Explanation</h4>
                <p>{result.llm_explanation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
