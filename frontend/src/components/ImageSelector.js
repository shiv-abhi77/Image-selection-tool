import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageSelector = () => {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [imageType, setImageType] = useState("profile");
  const [currentPage, setCurrentPage] = useState(1);
  const athletesPerPage = 5;
  const url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
  const [totalAthletes, setTotalAthletes] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: athletesPerPage,
    });
    // Set the URL parameters in the browser
    window.history.replaceState(null, "", `?${params.toString()}`);
    axios
      .get(`${url}/api/images/athletes/unselected?${params.toString()}`)
      .then((res) => {
        setAthletes(res.data.athletes);
        setTotalAthletes(res.data.total);
      });
  }, [currentPage]);

  const totalPages = Math.ceil(totalAthletes / athletesPerPage);

  const handleAthleteSelect = (athlete) => {
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

    // Instead of filtering out the athlete, just refresh the current page
    setSelectedAthlete(null);
    setSelectedImages({});
    setImageType("profile");
    // Refetch the current page
    const params = new URLSearchParams({
      page: currentPage,
      limit: athletesPerPage,
    });
    axios
      .get(`${url}/api/images/athletes/unselected?${params.toString()}`)
      .then((res) => {
        setAthletes(res.data.athletes);
        setTotalAthletes(res.data.total);
      });
  };

  return (
    <div className="p-4">
      <h1>Select Athlete</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {athletes.map((a) => (
          <div
            key={a._id || a.athlete_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: 10,
              background:
                selectedAthlete?._id === a._id ? "#d1e7dd" : "#f8f9fa",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontWeight:
                    selectedAthlete?._id === a._id ? "bold" : "normal",
                }}
              >
                {a.athlete_name}
                {a.discipline && (
                  <span
                    style={{
                      color: "#888",
                      fontWeight: "normal",
                      marginLeft: 8,
                    }}
                  >
                    ({a.discipline})
                  </span>
                )}
              </span>
              <button
                onClick={() => handleAthleteSelect(a)}
                style={{ marginLeft: 10 }}
              >
                Select
              </button>
            </div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              Profile:{" "}
              {a.profileFinalized
                ? `Finalized at ${
                    a.profileFinalizedAt
                      ? new Date(a.profileFinalizedAt).toLocaleString()
                      : ""
                  }`
                : "Not finalized"}
              <br />
              Gallery:{" "}
              {a.galleryFinalized
                ? `Finalized at ${
                    a.galleryFinalizedAt
                      ? new Date(a.galleryFinalizedAt).toLocaleString()
                      : ""
                  }`
                : "Not finalized"}
            </div>
            {a.profileFinalized && a.profileImages.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <b>Profile Images:</b>
                <div style={{ display: "flex", gap: 6 }}>
                  {a.profileImages.map((img) => (
                    <img
                      key={img.image_id}
                      src={img.url}
                      alt={img.alt_text}
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
            {a.galleryFinalized && a.galleryImages.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <b>Gallery Images:</b>
                <div style={{ display: "flex", gap: 6 }}>
                  {a.galleryImages.map((img) => (
                    <img
                      key={img.image_id}
                      src={img.url}
                      alt={img.alt_text}
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
        ))}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                fontWeight: currentPage === pageNum ? "bold" : "normal",
                background: currentPage === pageNum ? "#d1e7dd" : undefined,
                border:
                  currentPage === pageNum
                    ? "2px solid #0d6efd"
                    : "1px solid #ccc",
                borderRadius: 4,
                minWidth: 32,
                minHeight: 32,
                margin: "0 2px",
              }}
              disabled={currentPage === pageNum}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {selectedAthlete && (
        <div>
          <h2>{selectedAthlete.athlete_name}</h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {(selectedAthlete.image_urls || []).map((image) => {
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
            Finalize Image
            {Object.keys(selectedImages).length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
