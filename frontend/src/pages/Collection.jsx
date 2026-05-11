import React, { useContext, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";

const Collection = () => {
  const { products, search, unitsSoldData = {} } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState(products || []);
  const [itemsPerLoad] = useState(20);
  const [visibleItems, setVisibleItems] = useState(itemsPerLoad);
  const filterRef = useRef(null);

  const [category, setCategory] = useState(
    searchParams.get("category") ? [searchParams.get("category")] : [],
  );
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");

  // Chevron Icon Components
  const ChevronDown = ({ className = "h-4 w-4" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  const ChevronUp = ({ className = "h-4 w-4" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    const value = e.target.value;
    setSubCategory((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  // Close filter when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    // Only add event listener for mobile view
    if (window.innerWidth < 640) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    applyFilter();
    setVisibleItems(itemsPerLoad); // Reset visible items when filters change
  }, [category, subCategory, search, products]);

  useEffect(() => {
    sortProducts();
  }, [sortType]);

  const applyFilter = () => {
    let productsCopy = (products || []).slice();

    if (search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category),
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory),
      );
    }

    setFilterProducts(productsCopy);
  };

  const sortProducts = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  const loadMore = () => {
    setVisibleItems((prev) =>
      Math.min(prev + itemsPerLoad, filterProducts.length),
    );
  };

  const currentItems = filterProducts.slice(0, visibleItems);
  const hasMoreItems = visibleItems < filterProducts.length;

  return (
    <div className="flex flex-col px-4 sm:flex-row gap-1 sm:gap-10 pt-4 sm:pt-10">
      {/* Filter Options */}
      <div className="min-w-60 mt-7 sm:relative" ref={filterRef}>
        {/* Filter Button - Fixed on mobile only */}
        <button
          className="my-2 text-xl text-gray-800 flex items-center cursor-pointer gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:sticky sm:top-4 z-40 bg-black/50 backdrop-blur-sm py-2 px-2 rounded-full border border-gray-200 fixed top-17.5 left-4 sm:static sm:bg-transparent sm:border-none sm:shadow-none sm:rounded-none"
          onClick={() => setShowFilter(!showFilter)}
          aria-expanded={showFilter}
          aria-controls="filter-section"
        >
          <span className="hidden sm:inline">
            <u>
              <b>FILTERS</b>
            </u>
          </span>
          <div className="text-white sm:hidden">
            {showFilter ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>

        {/* Mobile Filter Dropdown */}
        <div
          id="filter-section"
          className={`sm:hidden fixed top-35 left-4 right-4 z-50 ${
            showFilter
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible translate-y-2"
          } transition-all duration-200`}
        >
          <div className="flex gap-3">
            {/* Category Filter - Mobile */}
            <div className="flex-1 bg-black/70 backdrop-blur-sm border border-gray-600 pl-5 py-3 rounded-lg shadow-xl">
              <p className="mb-3 text-sm font-medium text-white">CATEGORIES</p>
              <div
                className="flex flex-col gap-2 text-sm font-light text-white"
                role="group"
                aria-label="Category filters"
              >
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="men"
                    onChange={toggleCategory}
                    aria-label="Men's clothing"
                  />
                  Men
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="women"
                    onChange={toggleCategory}
                    aria-label="Women's clothing"
                  />
                  Women
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="kids"
                    onChange={toggleCategory}
                    aria-label="Kids clothing"
                  />
                  Kids
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="boys"
                    onChange={toggleCategory}
                    aria-label="Boys clothing"
                  />
                  Boys
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="girls"
                    onChange={toggleCategory}
                    aria-label="Girls clothing"
                  />
                  Girls
                </label>
              </div>
            </div>

            {/* SubCategory Filter - Mobile */}
            <div className="flex-1 bg-black/70 backdrop-blur-sm border border-gray-600 pl-5 py-3 rounded-lg shadow-xl">
              <p className="mb-3 text-sm font-medium text-white">TYPE</p>
              <div
                className="flex flex-col gap-2 text-sm font-light text-white"
                role="group"
                aria-label="Type filters"
              >
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="topwear"
                    onChange={toggleSubCategory}
                    aria-label="Topwear"
                  />
                  Topwear
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="bottomwear"
                    onChange={toggleSubCategory}
                    aria-label="Bottomwear"
                  />
                  Bottomwear
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="footwear"
                    onChange={toggleSubCategory}
                    aria-label="Footwear"
                  />
                  Footwear
                </label>
                <label className="flex gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <input
                    className="w-3 accent-blue-500"
                    type="checkbox"
                    value="dresses"
                    onChange={toggleSubCategory}
                    aria-label="Dresses"
                  />
                  Dresses
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Filter */}
        <div className="hidden sm:block">
          {/* Category Filter - Desktop */}
          <div className="border bg-gray-100 border-gray-300 pl-5 py-3 mt-2">
            <p className="mb-3 text-sm font-medium">CATEGORIES</p>
            <div
              className="flex flex-col gap-2 text-sm font-light text-gray-700"
              role="group"
              aria-label="Category filters"
            >
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="men"
                  onChange={toggleCategory}
                  aria-label="Men's clothing"
                />
                Men
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="women"
                  onChange={toggleCategory}
                  aria-label="Women's clothing"
                />
                Women
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="kids"
                  onChange={toggleCategory}
                  aria-label="Kids clothing"
                />
                Kids
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="boys"
                  onChange={toggleCategory}
                  aria-label="Boys clothing"
                />
                Boys
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="girls"
                  onChange={toggleCategory}
                  aria-label="Girls clothing"
                />
                Girls
              </label>
            </div>
          </div>

          {/* SubCategory Filter - Desktop */}
          <div className="bg-gray-100 border border-gray-300 pl-5 py-3 my-5">
            <p className="mb-3 text-sm font-medium">TYPE</p>
            <div
              className="flex flex-col gap-2 text-sm font-light text-gray-700"
              role="group"
              aria-label="Type filters"
            >
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="topwear"
                  onChange={toggleSubCategory}
                  aria-label="Topwear"
                />
                Topwear
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="bottomwear"
                  onChange={toggleSubCategory}
                  aria-label="Bottomwear"
                />
                Bottomwear
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="footwear"
                  onChange={toggleSubCategory}
                  aria-label="Footwear"
                />
                Footwear
              </label>
              <label className="flex gap-2 cursor-pointer">
                <input
                  className="w-3"
                  type="checkbox"
                  value="dresses"
                  onChange={toggleSubCategory}
                  aria-label="Dresses"
                />
                Dresses
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-xl sm:text-3xl -mb-2 sm:-mb-1">
          <Title text1={"OUR"} text2={"COLLECTION"} />

          {/* Product Sort */}
          <div className="relative flex-shrink-0 w-24 sm:w-32 md:w-40 lg:w-auto">
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="w-full border-2 bg-gray-100 border-gray-300 text-xs sm:text-sm px-2 py-1 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              aria-label="Sort products by"
              value={sortType}
            >
              <option value="relavent">Sort by: Relavent</option>
              <option value="low-high">Sort by: Low to High</option>
              <option value="high-low">Sort by: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
              <ChevronDown className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-600" aria-live="polite">
          Showing {Math.min(visibleItems, filterProducts.length)} of{" "}
          {filterProducts.length} products
        </div>
        {/* Map Products */}
        <div
          className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6"
          role="list"
          aria-label="Product collection"
        >
          {currentItems.map((item, index) => (
            <ProductItem
              key={item._id || index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
              bestseller={item.bestseller}
              unitsSold={unitsSoldData[item._id]}
            />
          ))}
        </div>

        {/* No results message */}
        {currentItems.length === 0 && (
          <div className="text-center py-12 text-gray-500" role="status">
            <p className="text-lg mb-2">No products found</p>
            <p className="text-sm">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* View More Button */}
        {hasMoreItems && (
          <div className="flex justify-center mt-8 mb-12">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              aria-label="Load more products"
            >
              View More
            </button>
          </div>
        )}

        {/* End of results message */}
        {!hasMoreItems && filterProducts.length > 0 && (
          <div className="text-center py-8 text-gray-500" role="status">
            <p>You've reached the end of the collection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Collection);
