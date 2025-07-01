import React from "react";

const ManualImageInput = ({
  manualUrl,
  setManualUrl,
  onFinalize,
  disabled,
}) => (
  <div style={{ marginTop: "20px" }}>
    <input
      type="text"
      placeholder="Paste image URL if none above are good"
      value={manualUrl}
      onChange={(e) => setManualUrl(e.target.value)}
      style={{ width: "60%", padding: "8px", marginRight: "10px" }}
    />
    <button
      onClick={onFinalize}
      disabled={disabled}
      style={{ padding: "8px 16px" }}
    >
      Finalize Manual Image
    </button>
  </div>
);

export default ManualImageInput;
