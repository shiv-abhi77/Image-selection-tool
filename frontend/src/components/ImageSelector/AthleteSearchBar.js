import React from "react";

const AthleteSearchBar = ({ searchTerm, setSearchTerm, onSearch }) => (
  <form onSubmit={onSearch} style={{ marginBottom: 16 }}>
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
);

export default AthleteSearchBar;
