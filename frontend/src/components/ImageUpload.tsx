import React, { useState } from "react";

interface Props {
  onSubmit: (file: File, crop?: string, description?: string) => void;
}

export const ImageUpload: React.FC<Props> = ({ onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState("");
  const [notes, setNotes] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    onSubmit(file, crop || undefined, notes || undefined);
    setNotes("");
  };

  return (
    <section className="sidebar-section">
      <h2 className="sidebar-title">Leaf &amp; pest check</h2>
      <p className="sidebar-help">
        Upload a photo of an affected plant, and Prometheus will suggest a diagnosis and
        treatment plan.
      </p>
      <form onSubmit={handleSubmit} className="image-form">
        <div className="form-field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="form-field">
          <label>Crop</label>
          <input
            type="text"
            value={crop}
            onChange={e => setCrop(e.target.value)}
            placeholder="e.g. tomatoes"
          />
        </div>
        <div className="form-field">
          <label>What do you see?</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. brown spots on lower leaves"
            rows={2}
          />
        </div>
        <button
          type="submit"
          className="secondary-button"
          disabled={!file}
        >
          Analyze image
        </button>
      </form>
    </section>
  );
};

