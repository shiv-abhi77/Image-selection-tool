import React from "react";
import AthleteCard from "./AthleteCard";

const AthleteList = ({ athletes, selectedAthlete, onSelect }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      marginBottom: "20px",
    }}
  >
    {athletes.map((a) => (
      <AthleteCard
        key={a._id || a.athlete_id}
        athlete={a}
        selected={selectedAthlete?._id === a._id}
        onSelect={onSelect}
      />
    ))}
  </div>
);

export default AthleteList;
