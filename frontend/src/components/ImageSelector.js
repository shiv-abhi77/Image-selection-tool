import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageSelector = () => {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [imageType, setImageType] = useState("profile");
  const url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${url}/api/images/athletes/unselected`)
      .then((res) => setAthletes(res.data));
  }, []);

  const handleDropdownChange = (e) => {
    const athlete = athletes.find((a) => a.athlete_id === e.target.value);
    setSelectedAthlete(athlete);
  };

  const toggleImageSelect = (image) => {
    setSelectedImages((prev) => {
      const exists = prev[image.image_id];
      const newSelection = { ...prev };
      if (exists) delete newSelection[image.image_id];
      else newSelection[image.image_id] = image;
      return newSelection;
    });
  };

  const saveSelectedImages = async () => {
    if (!selectedAthlete || Object.keys(selectedImages).length === 0) return;

    await axios.post(`${url}/api/images/finalize`, {
      athleteId: selectedAthlete._id || selectedAthlete.athlete_id,
      selected_images: Object.values(selectedImages),
      type: imageType,
    });

    alert(`${imageType} images finalized!`);

    setAthletes((prev) =>
      prev.filter(
        (a) =>
          (a._id || a.athlete_id) !==
          (selectedAthlete._id || selectedAthlete.athlete_id)
      )
    );
    setSelectedAthlete(null);
    setSelectedImages({});
    setImageType("profile");
  };

  return (
    <div className="p-4">
      <h1>Select Athlete</h1>

      <select
        onChange={handleDropdownChange}
        value={selectedAthlete?.athlete_id || ""}
      >
        <option value="" disabled>
          Select athlete
        </option>
        {athletes.map((a) => (
          <option key={a.athlete_id} value={a.athlete_id}>
            {a.athlete_name}
          </option>
        ))}
      </select>

      {selectedAthlete && (
        <div>
          <h2>{selectedAthlete.athlete_name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {selectedAthlete.image_urls.map((image) => {
              const isSelected = selectedImages[image.image_id];
              return (
                <div
                  key={image.image_id}
                  onClick={() => toggleImageSelect(image)}
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
                    alt={image.alt_text}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
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
          <select
            value={imageType}
            onChange={(e) => setImageType(e.target.value)}
            style={{
              marginTop: "10px",
              marginBottom: "10px",
              paddingRight: "100px",
              gap: "100px",
            }}
          >
            <option value="profile">Profile</option>
            <option value="gallery">Gallery</option>
          </select>
          <button onClick={saveSelectedImages} style={{ marginTop: "20px" }}>
            Finalize Image{Object.keys(selectedImages).length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
