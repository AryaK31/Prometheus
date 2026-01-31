import React, { useState } from "react";
import { Farm3D } from "../components/Farm3D";
import "./FarmProfile.css";

interface Field {
  name: string;
  width: number;
  length: number;
  crop?: string;
  soilType?: string;
  irrigationMethod?: string;
}

export const FarmProfile: React.FC = () => {
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "Field 1", width: 10, length: 10 }
  ]);

  const addField = () => {
    setFields([
      ...fields,
      {
        name: `Field ${fields.length + 1}`,
        width: 10,
        length: 10
      }
    ]);
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <div className="farm-profile-page">
      <div className="farm-profile-container">
        <div className="farm-profile-form">
          <h1>Farm Profile & Visualization</h1>
          <p className="profile-subtitle">
            Build your farm's digital twin by adding fields and details
          </p>

          <div className="profile-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-field">
                <label>Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  placeholder="e.g., Green Valley Farm"
                />
              </div>
              <div className="form-field">
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Iowa, USA"
                />
              </div>
              <div className="form-field">
                <label>Total Area (hectares)</label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={e => setTotalArea(e.target.value)}
                  placeholder="e.g., 50"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h3>Fields</h3>
              <button className="add-field-button" onClick={addField}>
                + Add Field
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={index} className="field-card">
                <div className="field-header">
                  <h4>{field.name}</h4>
                  {fields.length > 1 && (
                    <button
                      className="remove-field-button"
                      onClick={() => removeField(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="field-grid">
                  <div className="form-field">
                    <label>Field Name</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={e => updateField(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Width (meters)</label>
                    <input
                      type="number"
                      value={field.width}
                      onChange={e => updateField(index, { width: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Length (meters)</label>
                    <input
                      type="number"
                      value={field.length}
                      onChange={e => updateField(index, { length: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Crop</label>
                    <input
                      type="text"
                      value={field.crop || ""}
                      onChange={e => updateField(index, { crop: e.target.value })}
                      placeholder="e.g., Corn"
                    />
                  </div>
                  <div className="form-field">
                    <label>Soil Type</label>
                    <select
                      value={field.soilType || ""}
                      onChange={e => updateField(index, { soilType: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="sandy">Sandy</option>
                      <option value="loam">Loam</option>
                      <option value="clay">Clay</option>
                      <option value="silt">Silt</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Irrigation Method</label>
                    <select
                      value={field.irrigationMethod || ""}
                      onChange={e => updateField(index, { irrigationMethod: e.target.value })}
                    >
                      <option value="">Select...</option>
                      <option value="drip">Drip</option>
                      <option value="sprinkler">Sprinkler</option>
                      <option value="flood">Flood</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="profile-section">
            <h3>Upload Farm Images</h3>
            <p className="profile-help">
              Upload multiple images from your camera or drone for better visualization
            </p>
            <div className="image-upload-area">
              <input
                type="file"
                multiple
                accept="image/*"
                className="file-input"
                id="farm-images"
              />
              <label htmlFor="farm-images" className="file-label">
                📷 Choose Images or Drag & Drop
              </label>
            </div>
          </div>
        </div>

        <div className="farm-visualization">
          <h3>3D Farm Visualization</h3>
          <Farm3D fields={fields} />
          <p className="visualization-note">
            Move your mouse to rotate the view. Fields are color-coded: green = has crop, brown = fallow.
          </p>
        </div>
      </div>
    </div>
  );
};
