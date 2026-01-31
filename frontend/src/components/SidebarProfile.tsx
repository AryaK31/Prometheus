import React from "react";
import type { FarmerProfile } from "../App";

interface Props {
  profile: FarmerProfile;
  onChange: (profile: FarmerProfile) => void;
}

export const SidebarProfile: React.FC<Props> = ({ profile, onChange }) => {
  const updateField = (field: keyof FarmerProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <section className="sidebar-section">
      <h2 className="sidebar-title">Farm profile</h2>
      <p className="sidebar-help">
        Tell Prometheus a bit about your farm so it can tailor advice.
      </p>
      <div className="form-field">
        <label>Farmer name</label>
        <input
          type="text"
          value={profile.name || ""}
          onChange={e => updateField("name", e.target.value)}
          placeholder="Optional"
        />
      </div>
      <div className="form-field">
        <label>Location</label>
        <input
          type="text"
          value={profile.location || ""}
          onChange={e => updateField("location", e.target.value)}
          placeholder="e.g. Iowa, USA"
        />
      </div>
      <div className="form-field">
        <label>Primary crops</label>
        <input
          type="text"
          value={profile.primaryCrops || ""}
          onChange={e => updateField("primaryCrops", e.target.value)}
          placeholder="e.g. corn, soybeans"
        />
      </div>
      <div className="form-field">
        <label>Notes</label>
        <textarea
          value={profile.notes || ""}
          onChange={e => updateField("notes", e.target.value)}
          placeholder="Soil type, irrigation method, common issues..."
          rows={3}
        />
      </div>
    </section>
  );
};

