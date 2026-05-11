import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (location.pathname.includes("collection")) {
      setVisible(true);
      // REMOVED the auto-focus timeout that was causing the issue
    } else {
      setVisible(false);
    }
  }, [location]);

  // Function to focus input when search icon is clicked
  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return visible ? (
    <div
      className="bg-black/50 backdrop-blur-sm text-center fixed sm:top-17 top-13.5 left-0 right-0 z-40"
      role="search"
      aria-label="Product search"
    >
      <div className="inline-flex items-center justify-center bg-gradient-to-r from-indigo-300 to-purple-300 border border-gray-200 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2 ml-8 mr-auto">
        <input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 outline-none bg-inherit text-sm"
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          enterKeyHint="search"
        />
        {/* Make the search icon clickable */}
        <button
          type="button"
          onClick={handleSearchIconClick}
          className="flex items-center justify-center"
          aria-label="Focus search input"
        >
          <img className="w-4" src={assets.search} alt="Search icon" />
        </button>
      </div>
    </div>
  ) : null;
};

export default SearchBar;
