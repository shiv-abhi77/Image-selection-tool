import React from "react";

const ImageGrid = ({ images, selectedImages, onToggle }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
    {images.map((image) => {
      const isSelected = selectedImages[image.image_id];
      return (
        <div
          key={image.image_id}
          onClick={() => onToggle(image)}
          style={{
            position: "relative",
            width: "20%",
            border: isSelected ? "3px solid green" : "1px solid gray",
            borderRadius: "8px",
            overflow: "hidden",
            cursor: "pointer",
            padding: "4px",
            boxSizing: "border-box",
          }}
        >
          <img
            src={image.url}
            alt={image.text || image.alt_text || ""}
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              display: "block",
              marginBottom: "8px",
            }}
          />
          {image.text && (
            <div
              style={{
                fontSize: "12px",
                padding: "4px",
                color: "#666",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {image.text}
            </div>
          )}
          {image.source && (
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                padding: "2px 4px 0 4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {image.source}
            </div>
          )}
          {isSelected && (
            <div
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                backgroundColor: "green",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              ✓
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export default ImageGrid;
