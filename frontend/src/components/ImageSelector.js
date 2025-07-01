import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageSelector = () => {
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedImages, setSelectedImages] = useState({});
  const [imageType, setImageType] = useState("gallery");
  const [currentPage, setCurrentPage] = useState(1);
  const athletesPerPage = 5;
  const url = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [manualUrl, setManualUrl] = useState("");

  // Regex search for athletes
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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
    setSelectedImages({});
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

  const imageTypeOptions = [
    { label: "Gallery", value: "gallery" },
    { label: "Hero", value: "hero" },
    { label: "Avatar", value: "cover" },
  ];

  // Map image type to backend endpoint
  const getFinalizeEndpoint = (type) => {
    if (type === "gallery") return "/api/images/finalize/gallery";
    if (type === "hero") return "/api/images/finalize/hero";
    if (type === "cover") return "/api/images/finalize/cover";
    // fallback
    return "/api/images/finalize/cover";
  };

  const validateSelection = () => {
    if (!selectedAthlete) return false;
    const selectedCount = Object.keys(selectedImages).length;
    if (imageType === "hero") {
      return selectedCount === 1;
    }
    if (imageType === "cover") {
      return selectedCount === 1;
    }
    if (imageType === "gallery") {
      return selectedCount > 0;
    }
    return false;
  };

  const saveSelectedImages = async () => {
    if (!selectedAthlete) return;
    const selectedCount = Object.keys(selectedImages).length;
    // Validation for each type
    if (imageType === "hero" && selectedCount !== 1) {
      alert("You must select exactly one image for hero.");
      return;
    }
    if (imageType === "cover" && selectedCount !== 1) {
      alert("You must select exactly one image for cover.");
      return;
    }
    if (imageType === "gallery" && selectedCount === 0) {
      alert("You must select at least one image for gallery.");
      return;
    }
    await axios.post(`${url}${getFinalizeEndpoint(imageType)}`, {
      athleteId: selectedAthlete.athlete_id,
      selected_images: Object.values(selectedImages).map((img) => ({
        url: img.url,
        source: img.source,
        text: img.text,
      })),
    });
    alert(`${imageType} image${selectedCount > 1 ? "s" : ""} finalized!`);
    setSelectedAthlete(null);
    setSelectedImages({});
    setImageType("gallery");
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const res = await axios.get(
      `${url}/api/images/athletes/search?q=${encodeURIComponent(searchTerm)}`
    );
    setSearchResults(res.data);
  };

  // Normalize image_urls for selectedAthlete
  const getNormalizedImageUrls = (athlete) => {
    if (!athlete) return [];
    // If already in the new format (array of objects with url/text/source)
    if (
      Array.isArray(athlete.image_urls) &&
      typeof athlete.image_urls[0] === "object" &&
      athlete.image_urls[0] !== null &&
      athlete.image_urls[0].url
    ) {
      return athlete.image_urls.map((img, idx) => ({
        ...img,
        image_id: img.image_id || `${img.url}_${idx}`,
      }));
    }
    // If array of strings (legacy)
    if (
      Array.isArray(athlete.image_urls) &&
      typeof athlete.image_urls[0] === "string"
    ) {
      return athlete.image_urls.map((url, idx) => ({
        url,
        text: "",
        source: "",
        image_id: url + "_" + idx,
      }));
    }
    return [];
  };

  return (
    <div className="p-4">
      <h1>Select Athlete</h1>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search athlete by name..."
          style={{ padding: 8, width: 300, marginRight: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Search
        </button>
      </form>
      {searchResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>Search Results:</b>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {searchResults.map((a) => (
              <li key={a.athlete_id} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: "bold" }}>{a.athlete_name}</span>
                {a.discipline && (
                  <span style={{ color: "#888", marginLeft: 8 }}>
                    ({a.discipline})
                  </span>
                )}
                <button
                  style={{ marginLeft: 12, padding: "4px 12px" }}
                  onClick={() => {
                    setSelectedAthlete(a);
                    setSelectedImages({});
                    setSearchResults([]);
                    setSearchTerm("");
                  }}
                >
                  Select
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
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
              {a.heroImageFinalized && a.heroImageUrl && (
                <div style={{ marginBottom: 4 }}>
                  <b>Hero Image:</b>
                  <img
                    src={a.heroImageUrl}
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
                  {a.heroFinalizedAt && (
                    <span
                      style={{ fontSize: 11, color: "#888", marginLeft: 8 }}
                    >
                      Finalized at{" "}
                      {new Date(a.heroFinalizedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
              {a.coverImageFinalized && a.coverImageUrl && (
                <div style={{ marginBottom: 4 }}>
                  <b>Cover Image:</b>
                  <img
                    src={a.coverImageUrl}
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
                  {a.coverFinalizedAt && (
                    <span
                      style={{ fontSize: 11, color: "#888", marginLeft: 8 }}
                    >
                      Finalized at{" "}
                      {new Date(a.coverFinalizedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
              Gallery:{" "}
              {a.galleryFinalized
                ? `Finalized at ${
                    a.galleryFinalizedAt
                      ? new Date(a.galleryFinalizedAt).toLocaleString()
                      : ""
                  }`
                : "Not finalized"}
            </div>

            {a.galleryFinalized && a.galleryImages.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <b>Gallery Images:</b>
                <div style={{ display: "flex", gap: 6 }}>
                  {a.galleryImages.map((img, idx) => (
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
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
            )
          )}
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {getNormalizedImageUrls(selectedAthlete).map((image) => {
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
          <div style={{ marginTop: "20px", marginBottom: "10px" }}>
            {imageTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setImageType(opt.value)}
                style={{
                  padding: "8px 24px",
                  marginRight: "10px",
                  borderRadius: "6px",
                  border:
                    imageType === opt.value
                      ? "2px solid #0d6efd"
                      : "1px solid #ccc",
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
          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Paste image URL if none above are good"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              style={{ width: "60%", padding: "8px", marginRight: "10px" }}
            />
            <button
              onClick={async () => {
                if (!manualUrl) return;
                await axios.post(`${url}${getFinalizeEndpoint(imageType)}`, {
                  athleteId: selectedAthlete.athlete_id,
                  selected_images: [
                    { url: manualUrl, source: null, text: null },
                  ],
                });
                alert("Manual image finalized!");
                setSelectedAthlete(null);
                setSelectedImages({});
                setManualUrl("");
                setImageType("gallery");
                // Refetch the current page
                const params = new URLSearchParams({
                  page: currentPage,
                  limit: athletesPerPage,
                });
                axios
                  .get(
                    `${url}/api/images/athletes/unselected?${params.toString()}`
                  )
                  .then((res) => {
                    setAthletes(res.data.athletes);
                    setTotalAthletes(res.data.total);
                  });
              }}
              disabled={!manualUrl}
              style={{ padding: "8px 16px" }}
            >
              Finalize Manual Image
            </button>
          </div>
          <button
            onClick={saveSelectedImages}
            style={{ marginTop: "20px", padding: "8px 16px" }}
            disabled={!validateSelection()}
          >
            Finalize Image
            {Object.keys(selectedImages).length > 1 ? "s" : ""}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
