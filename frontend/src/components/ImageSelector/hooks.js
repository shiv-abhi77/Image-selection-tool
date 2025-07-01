import { useState, useEffect } from "react";
import axios from "axios";

export function usePaginatedAthletes(url, currentPage, athletesPerPage) {
  const [athletes, setAthletes] = useState([]);
  const [totalAthletes, setTotalAthletes] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams({
      page: currentPage,
      limit: athletesPerPage,
    });
    window.history.replaceState(null, "", `?${params.toString()}`);
    axios
      .get(`${url}/api/images/athletes/unselected?${params.toString()}`)
      .then((res) => {
        setAthletes(res.data.athletes);
        setTotalAthletes(res.data.total);
      });
  }, [url, currentPage, athletesPerPage]);

  return { athletes, totalAthletes };
}

export function useSearchAthletes(url) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const res = await axios.get(
      `${url}/api/images/athletes/search?q=${encodeURIComponent(searchTerm)}`
    );
    setSearchResults(res.data);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    handleSearch,
  };
}
