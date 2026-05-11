import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import {
  FaBox,
  FaStar,
  FaSearch,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
} from "react-icons/fa";

const List = ({ token }) => {
  const [productList, setProductList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [updatedProduct, setUpdatedProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestseller: false,
    sizes: [],
  });

  // Add units sold state
  const [unitsSoldData, setUnitsSoldData] = useState({});
  const [isUpdatingBestsellers, setIsUpdatingBestsellers] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(50);

  const searchInputRef = useRef(null);

  const topRef = useRef(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProductList(response.data.products);
        setFilteredList(response.data.products);
        setCurrentPage(1);
      }
    } catch (error) {
      // Error handling without logging
    }
  };

  const fetchUnitsSoldData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/units-sold`, {
        headers: { token },
      });

      if (response.data.success) {
        setUnitsSoldData(response.data.unitsSold || {});
      } else {
        setUnitsSoldData({});
      }
    } catch (error) {
      setUnitsSoldData({});
    }
  };

  // Normalize image source (accept string or array) and provide placeholder
  const getImageSrc = (item) => {
    if (!item) return null;
    const raw = Array.isArray(item.image) ? item.image[0] : item.image;
    return raw || null;
  };

  const updateBestsellerStatus = async () => {
    setIsUpdatingBestsellers(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/bestseller-update`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchList();
        await fetchUnitsSoldData();
      }
    } catch (error) {
      // Error handling without logging
    } finally {
      setIsUpdatingBestsellers(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchList();
      }
    } catch (error) {
      // Error handling without logging
    }
  };

  const startEditing = (product) => {
    setEditingProduct(product._id);
    setUpdatedProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory,
      bestseller: product.bestseller,
      sizes: [...product.sizes],
    });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setUpdatedProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      subCategory: "",
      bestseller: false,
      sizes: [],
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setUpdatedProduct((prev) => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  const updateProduct = async (id) => {
    try {
      const response = await axios.put(
        backendUrl + `/api/product/update/${id}`,
        updatedProduct,
        { headers: { token } }
      );

      if (response.data.success) {
        setEditingProduct(null);
        await fetchList();
      }
    } catch (error) {
      // Error handling without logging
    }
  };

  // Define size options based on subcategory
  const getSizeOptions = (subCategory) => {
    if (subCategory === "footwear") {
      return ["1", "2", "3", "4", "5"];
    }
    return ["S", "M", "L", "XL", "2XL"];
  };

  // Filter products based on search term and category
  const filterProducts = () => {
    let filtered = productList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory.toLowerCase()
      );
    }

    setFilteredList(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Get unique categories for filter dropdown
  const getCategories = () => {
    const categories = [
      ...new Set(productList.map((product) => product.category)),
    ];
    return categories.map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1));
  };

  // Count bestsellers
  const countBestsellers = () => {
    return productList.filter((product) => product.bestseller).length;
  };

  // Count auto bestsellers (20+ units sold)
  const countAutoBestsellers = () => {
    return productList.filter((product) => {
      const unitsSold = unitsSoldData[product._id] || 0;
      return unitsSold >= 20;
    }).length;
  };

  // Check if product is auto bestseller
  const isAutoBestseller = (productId) => {
    const unitsSold = unitsSoldData[productId] || 0;
    return unitsSold >= 20;
  };

  // Pagination functions
  const getCurrentProducts = () => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredList.slice(indexOfFirstProduct, indexOfLastProduct);
  };

  const totalPages = Math.ceil(filteredList.length / productsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, productList]);

  useEffect(() => {
    fetchList();
    fetchUnitsSoldData();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const currentProducts = getCurrentProducts();

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentPage]);

  return (
    <>
      {/* Summary Section */}
      <div ref={topRef} />
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          Product Management
        </h1>
        <p className="mb-4 text-sm sm:text-base">
          Manage your product inventory
        </p>

        {/* Responsive Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-blue-100 p-1.5 flex-shrink-0">
                <FaBox className="h-3 w-3 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  Total Products
                </p>
                <p className="text-base font-semibold text-gray-800 truncate">
                  {productList.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-yellow-100 p-1.5 flex-shrink-0">
                <FaStar className="h-3 w-3 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  All Bestsellers
                </p>
                <p className="text-base font-semibold text-gray-800 truncate">
                  {countBestsellers()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1.5 flex-shrink-0">
                <FaFire className="h-3 w-3 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">
                  Auto Bestsellers
                </p>
                <p className="text-base font-semibold text-gray-800 truncate">
                  {countAutoBestsellers()}
                </p>
              </div>
            </div>
          </div>

          {/* Bestseller Management Button Card */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow p-3 border border-orange-200">
            <button
              onClick={updateBestsellerStatus}
              disabled={isUpdatingBestsellers}
              className="w-full h-full flex items-start gap-2 text-left"
            >
              <div className="rounded-full bg-orange-100 p-1.5 flex-shrink-0">
                <FaFire className="h-3 w-3 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-orange-600 truncate">
                  Update Bestsellers
                </p>
                <div className="text-xs text-orange-500 mt-1">
                  {isUpdatingBestsellers ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    "20+ units sold"
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded shadow mb-6">
          <h3 className="font-semibold mb-3 text-sm sm:text-base">
            Search & Filter Products
          </h3>

          {/* Responsive Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
            <div className="flex-1 sm:flex-[2] w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, category, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none pr-8"
                >
                  <option value="All Categories">All Categories</option>
                  {getCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <button
                onClick={() => {
                  fetchList();
                  fetchUnitsSoldData();
                }}
                className="flex items-center justify-center w-full px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
              >
                <FaSyncAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Refresh List
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {(currentPage - 1) * productsPerPage + 1} to{" "}
            {Math.min(currentPage * productsPerPage, filteredList.length)} of{" "}
            {filteredList.length} products
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-1 sm:p-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>

              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-1 sm:p-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Products Table - Responsive for mobile */}
        <div className="overflow-hidden mt-2">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sub-Cat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.length > 0 ? (
                  currentProducts.map((item) => (
                    <React.Fragment key={item._id}>
                      {editingProduct === item._id ? (
                        // Edit Form - spans all columns
                        <tr>
                          <td
                            colSpan="8"
                            className="px-4 py-3 whitespace-nowrap"
                          >
                            <div className="border p-4 bg-white rounded-lg shadow">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block mb-1 font-medium">
                                    Product Name
                                  </label>
                                  <input
                                    name="name"
                                    value={updatedProduct.name}
                                    onChange={handleUpdateChange}
                                    className="w-full px-3 py-2 border rounded"
                                    type="text"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 font-medium">
                                    Description
                                  </label>
                                  <textarea
                                    name="description"
                                    value={updatedProduct.description}
                                    onChange={handleUpdateChange}
                                    className="w-full px-3 py-2 border rounded"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 font-medium">
                                    Category
                                  </label>
                                  <select
                                    name="category"
                                    value={updatedProduct.category}
                                    onChange={handleUpdateChange}
                                    className="w-full px-3 py-2 border rounded"
                                  >
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="kids">Kids</option>
                                    <option value="boys">Boys</option>
                                    <option value="girls">Girls</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block mb-1 font-medium">
                                    Sub Category
                                  </label>
                                  <select
                                    name="subCategory"
                                    value={updatedProduct.subCategory}
                                    onChange={handleUpdateChange}
                                    className="w-full px-3 py-2 border rounded"
                                  >
                                    <option value="topwear">Topwear</option>
                                    <option value="bottomwear">
                                      Bottomwear
                                    </option>
                                    <option value="footwear">Footwear</option>
                                    <option value="dresses">Dresses</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block mb-1 font-medium">
                                    Price ({currency})
                                  </label>
                                  <input
                                    name="price"
                                    value={updatedProduct.price}
                                    onChange={handleUpdateChange}
                                    className="w-full px-3 py-2 border rounded"
                                    type="number"
                                  />
                                </div>

                                <div>
                                  <label className="block mb-1 font-medium">
                                    Sizes
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    {getSizeOptions(
                                      updatedProduct.subCategory
                                    ).map((size) => (
                                      <div
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`cursor-pointer px-3 py-1 rounded border ${
                                          updatedProduct.sizes.includes(size)
                                            ? "bg-blue-100 border-blue-500 text-blue-700"
                                            : "bg-gray-100 border-gray-300 text-gray-700"
                                        }`}
                                      >
                                        {size}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center">
                                  <input
                                    name="bestseller"
                                    type="checkbox"
                                    checked={updatedProduct.bestseller}
                                    onChange={handleUpdateChange}
                                    id={`bestseller-${item._id}`}
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`bestseller-${item._id}`}
                                    className="cursor-pointer"
                                  >
                                    Bestseller
                                  </label>
                                </div>
                              </div>

                              <div className="flex justify-end gap-3 mt-4">
                                <button
                                  onClick={cancelEditing}
                                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => updateProduct(item._id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        // Product Row
                        <tr>
                          <td className="py-3 whitespace-nowrap">
                            {(() => {
                              const src = getImageSrc(item);
                              const placeholder =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">No Image</text></svg>';
                              return (
                                <img
                                  className="block w-20 h-20 object-contain flex-shrink-0"
                                  src={src || placeholder}
                                  alt={item.name || "product"}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = placeholder;
                                  }}
                                  key={item._id + (src || "")}
                                />
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.category}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.subCategory}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {currency}
                            {item.price}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {unitsSoldData[item._id] || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex flex-wrap gap-1">
                              {item.bestseller && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    isAutoBestseller(item._id)
                                      ? "bg-green-100 text-green-800 border border-green-300"
                                      : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                  }`}
                                >
                                  {isAutoBestseller(item._id)
                                    ? "🔥 Auto"
                                    : "⭐ Manual"}
                                </span>
                              )}
                              {isAutoBestseller(item._id) &&
                                !item.bestseller && (
                                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                                    Eligible
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2 justify-start">
                              <button
                                onClick={() => startEditing(item)}
                                className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeProduct(item._id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Enhanced Mobile Grid Layout */}
            <div className="sm:hidden">
              {currentProducts.length > 0 ? (
                <div className="space-y-3">
                  {currentProducts.map((item) => (
                    <React.Fragment key={item._id}>
                      {editingProduct === item._id ? (
                        <div className="border p-3 bg-white rounded-lg shadow">
                          <div className="space-y-3">
                            <div>
                              <label className="block mb-1 font-medium text-sm">
                                Product Name
                              </label>
                              <input
                                name="name"
                                value={updatedProduct.name}
                                onChange={handleUpdateChange}
                                className="w-full px-3 py-2 border rounded text-sm"
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium text-sm">
                                Description
                              </label>
                              <textarea
                                name="description"
                                value={updatedProduct.description}
                                onChange={handleUpdateChange}
                                className="w-full px-3 py-2 border rounded text-sm"
                                rows="2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1 font-medium text-sm">
                                  Category
                                </label>
                                <select
                                  name="category"
                                  value={updatedProduct.category}
                                  onChange={handleUpdateChange}
                                  className="w-full px-2 py-2 border rounded text-sm"
                                >
                                  <option value="men">Men</option>
                                  <option value="women">Women</option>
                                  <option value="kids">Kids</option>
                                  <option value="boys">Boys</option>
                                  <option value="girls">Girls</option>
                                </select>
                              </div>
                              <div>
                                <label className="block mb-1 font-medium text-sm">
                                  Sub Category
                                </label>
                                <select
                                  name="subCategory"
                                  value={updatedProduct.subCategory}
                                  onChange={handleUpdateChange}
                                  className="w-full px-2 py-2 border rounded text-sm"
                                >
                                  <option value="topwear">Topwear</option>
                                  <option value="bottomwear">Bottomwear</option>
                                  <option value="footwear">Footwear</option>
                                  <option value="dresses">Dresses</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block mb-1 font-medium text-sm">
                                Price ({currency})
                              </label>
                              <input
                                name="price"
                                value={updatedProduct.price}
                                onChange={handleUpdateChange}
                                className="w-full px-3 py-2 border rounded text-sm"
                                type="number"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 font-medium text-sm">
                                Sizes
                              </label>
                              <div className="flex flex-wrap gap-1">
                                {getSizeOptions(updatedProduct.subCategory).map(
                                  (size) => (
                                    <div
                                      key={size}
                                      onClick={() => toggleSize(size)}
                                      className={`cursor-pointer px-2 py-1 rounded border text-xs ${
                                        updatedProduct.sizes.includes(size)
                                          ? "bg-blue-100 border-blue-500 text-blue-700"
                                          : "bg-gray-100 border-gray-300 text-gray-700"
                                      }`}
                                    >
                                      {size}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <input
                                name="bestseller"
                                type="checkbox"
                                checked={updatedProduct.bestseller}
                                onChange={handleUpdateChange}
                                id={`bestseller-${item._id}`}
                                className="mr-2"
                              />
                              <label
                                htmlFor={`bestseller-${item._id}`}
                                className="cursor-pointer text-sm"
                              >
                                Bestseller
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => updateProduct(item._id)}
                              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex gap-3">
                            {(() => {
                              const src = getImageSrc(item);
                              const placeholder =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="10">No Image</text></svg>';
                              return (
                                <img
                                  className="block w-20 h-20 object-contain flex-shrink-0"
                                  src={src || placeholder}
                                  alt={item.name || "product"}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = placeholder;
                                  }}
                                  key={item._id + (src || "")}
                                />
                              );
                            })()}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {item.name}
                              </h3>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.category} / {item.subCategory}
                              </div>
                              <div className="text-sm font-medium text-gray-700 mt-1">
                                {currency}
                                {item.price}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Sold: {unitsSoldData[item._id] || 0}
                              </div>
                              {/* Bestseller badges for mobile */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.bestseller && (
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      isAutoBestseller(item._id)
                                        ? "bg-green-100 text-green-800 border border-green-300"
                                        : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                                    }`}
                                  >
                                    {isAutoBestseller(item._id)
                                      ? "🔥 Auto"
                                      : "⭐ Manual"}
                                  </span>
                                )}
                                {isAutoBestseller(item._id) &&
                                  !item.bestseller && (
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                                      Eligible
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-3">
                            <button
                              onClick={() => startEditing(item)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex-1 sm:flex-none"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeProduct(item._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex-1 sm:flex-none"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
            <div className="text-xs sm:text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Previous
              </button>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default List;
