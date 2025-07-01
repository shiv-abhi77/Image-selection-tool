import React from "react";

const ImageTypeSelector = ({ imageType, options, onChange }) => (
  <div style={{ marginTop: "20px", marginBottom: "10px" }}>
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          padding: "8px 24px",
          marginRight: "10px",
          borderRadius: "6px",
          border:
            imageType === opt.value ? "2px solid #0d6efd" : "1px solid #ccc",
          background: imageType === opt.value ? "#d1e7dd" : "#f8f9fa",
          fontWeight: imageType === opt.value ? "bold" : "normal",
          color: imageType === opt.value ? "#0d6efd" : undefined,
          cursor: "pointer",
        }}
        disabled={imageType === opt.value}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default ImageTypeSelector;
