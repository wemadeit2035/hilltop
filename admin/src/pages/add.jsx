import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import {
  FiUpload,
  FiPlus,
  FiX,
  FiStar,
  FiShoppingBag,
  FiInfo,
} from "react-icons/fi";

const Add = ({ token }) => {
  const [image, setimage] = useState([]);
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("men");
  const [subCategory, setSubCategory] = useState("topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSizes([]);
  }, [subCategory]);

  const handleimageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setimage(files);
  };

  const removeimage = (index, e) => {
    e.stopPropagation();
    setimage((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("sizes", JSON.stringify(sizes));
      formData.append("bestseller", bestseller);

      image.forEach((image, index) => {
        formData.append(`image${index + 1}`, image);
      });

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        setName("");
        setDescription("");
        setimage([]);
        setPrice("");
        setSizes([]);
        setBestseller(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((item) => item !== size)
        : [...prev, size]
    );
  };

  const clothingSizes = ["S", "M", "L", "XL", "2XL"];
  const footwearSizes = ["1", "2", "3", "4", "5"];
  const currentSizes =
    subCategory === "footwear" ? footwearSizes : clothingSizes;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold mb-1">Add New Product</h1>
        <p className="text-sm text-gray-600">Create a new product listing</p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        {/* image Upload Section */}
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-2">
            <FiUpload className="text-blue-600 text-sm" />
            <h2 className="text-base font-semibold text-gray-900">
              Product image
            </h2>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Upload up to 4 product image
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
            {image.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  className="w-full h-32 object-cover rounded-md border border-blue-200 shadow-sm cursor-pointer transition-all duration-200"
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  onClick={triggerFileInput}
                />
                <button
                  type="button"
                  onClick={(e) => removeimage(index, e)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm text-xs"
                >
                  <FiX size={10} />
                </button>
              </div>
            ))}

            {Array.from({ length: 4 - image.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="border border-dashed border-gray-300 rounded-md h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 p-2"
                onClick={triggerFileInput}
              >
                <FiPlus className="text-gray-400 mb-1" size={16} />
                <p className="text-xs text-gray-500 text-center">Add image</p>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            onChange={handleimageChange}
            type="file"
            multiple
            accept="image/*"
            hidden
          />
        </div>

        {/* Basic Information */}
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-2">
            <FiInfo className="text-blue-600 text-sm" />
            <h2 className="text-base font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                type="text"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price (ZAR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 text-sm">
                  R
                </span>
                <input
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  className="w-full pl-6 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Description *
              </label>
              <textarea
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 h-24 resize-none"
                placeholder="Describe your product..."
                required
              />
            </div>
          </div>
        </div>

        {/* Category & Sizing */}
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-2">
            <FiShoppingBag className="text-blue-600 text-sm" />
            <h2 className="text-base font-semibold text-gray-900">
              Categories & Sizing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Main Category
              </label>
              <select
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <select
                onChange={(e) => setSubCategory(e.target.value)}
                value={subCategory}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="topwear">Topwear</option>
                <option value="bottomwear">Bottomwear</option>
                <option value="footwear">Footwear</option>
                <option value="dresses">Dresses</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-all duration-200 font-medium ${
                      sizes.includes(size)
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bestseller Option */}
        <div className="mb-5">
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-md border border-yellow-200">
            <FiStar className="text-yellow-500 flex-shrink-0 text-sm" />
            <div className="flex-1">
              <label className="flex items-center cursor-pointer">
                <input
                  onChange={() => setBestseller((prev) => !prev)}
                  checked={bestseller}
                  type="checkbox"
                  className="sr-only"
                />
                <div className="relative">
                  <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                      bestseller ? "bg-yellow-500" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      bestseller ? "transform translate-x-5" : ""
                    }`}
                  />
                </div>
                <span className="ml-2 text-xs font-medium text-gray-900">
                  Mark as Bestseller
                </span>
              </label>
              <p className="text-xs text-yellow-700 mt-0.5">
                Featured prominently in store
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding Product...
              </div>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Add;
