import React from "react";

const AthleteCard = ({ athlete, selected, onSelect }) => (
  <div
    style={{
      border: "1px solid #ccc",
      borderRadius: 6,
      padding: 10,
      background: selected ? "#d1e7dd" : "#f8f9fa",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontWeight: selected ? "bold" : "normal" }}>
        {athlete.athlete_name}
        {athlete.discipline && (
          <span style={{ color: "#888", fontWeight: "normal", marginLeft: 8 }}>
            ({athlete.discipline})
          </span>
        )}
      </span>
      <button onClick={() => onSelect(athlete)} style={{ marginLeft: 10 }}>
        Select
      </button>
    </div>
    <div style={{ fontSize: 13, marginTop: 4 }}>
      {athlete.heroImageFinalized && athlete.heroImageUrl && (
        <div style={{ marginBottom: 4 }}>
          <b>Hero Image:</b>
          <img
            src={athlete.heroImageUrl}
            alt="Hero"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
              marginLeft: 8,
              verticalAlign: "middle",
            }}
          />
          {athlete.heroFinalizedAt && (
            <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>
              Finalized at {new Date(athlete.heroFinalizedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}
      {athlete.coverImageFinalized && athlete.coverImageUrl && (
        <div style={{ marginBottom: 4 }}>
          <b>Cover Image:</b>
          <img
            src={athlete.coverImageUrl}
            alt="Cover"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
              marginLeft: 8,
              verticalAlign: "middle",
            }}
          />
          {athlete.coverFinalizedAt && (
            <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>
              Finalized at {new Date(athlete.coverFinalizedAt).toLocaleString()}
            </span>
          )}
        </div>
      )}
      Gallery:{" "}
      {athlete.galleryFinalized
        ? `Finalized at ${
            athlete.galleryFinalizedAt
              ? new Date(athlete.galleryFinalizedAt).toLocaleString()
              : ""
          }`
        : "Not finalized"}
    </div>
    {athlete.galleryFinalized && athlete.galleryImages.length > 0 && (
      <div style={{ marginTop: 4 }}>
        <b>Gallery Images:</b>
        <div style={{ display: "flex", gap: 6 }}>
          {athlete.galleryImages.map((img, idx) => (
            <img
              key={img.url + idx}
              src={img.url}
              alt={img.text || img.alt_text || ""}
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);

export default AthleteCard;
