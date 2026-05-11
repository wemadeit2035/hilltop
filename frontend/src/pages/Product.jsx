import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [currentimageIndex, setCurrentimageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch individual product data directly from API to get all image
  const fetchProductData = async () => {
    try {
      setLoading(true);

      // Always fetch directly from API to get full product data with all image
      const response = await fetch(`${backendUrl}/api/product/single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.product) {
          setProductData(data.product);
          // Set the first image as default
          if (
            data.product.image &&
            Array.isArray(data.product.image) &&
            data.product.image.length > 0
          ) {
            setCurrentimageIndex(0);
          }
        }
      } else {
        throw new Error("Failed to fetch product");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      // Fallback to existing products if API call fails
      if (products && products.length > 0) {
        const foundProduct = products.find((item) => item._id === productId);
        if (foundProduct) {
          setProductData(foundProduct);
          const imageData = foundProduct.image;
          if (Array.isArray(imageData) && imageData.length > 0) {
            setCurrentimageIndex(0);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  // Enhanced add to cart handler with authentication check
  const handleAddToCart = () => {
    if (!size) return;

    if (!token) {
      setShowLoginPrompt(true);

      const pendingCartItem = {
        productId: productData._id,
        size: size,
        redirectUrl: window.location.pathname,
      };
      localStorage.setItem("pendingCartItem", JSON.stringify(pendingCartItem));

      setTimeout(() => {
        navigate("/login");
      }, 1500);
      return;
    }

    addToCart(productData._id, size);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  // image slider navigation functions
  const nextimage = () => {
    if (productData && productData.image) {
      setCurrentimageIndex((prevIndex) =>
        prevIndex === productData.image.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const previmage = () => {
    if (productData && productData.image) {
      setCurrentimageIndex((prevIndex) =>
        prevIndex === 0 ? productData.image.length - 1 : prevIndex - 1
      );
    }
  };

  // Safely get image array for rendering
  const getProductimage = () => {
    if (!productData || !productData.image) {
      return [];
    }

    if (Array.isArray(productData.image)) {
      return productData.image;
    }

    return [];
  };

  // Safely get sizes array for rendering
  const getProductSizes = () => {
    if (!productData || !productData.sizes) return [];

    if (Array.isArray(productData.sizes)) {
      return productData.sizes;
    }

    return [];
  };

  // Structured data for product page SEO
  const productStructuredData = productData
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productData.name,
        description: productData.description,
        image: getProductimage(),
        offers: {
          "@type": "Offer",
          price: productData.price,
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        brand: {
          "@type": "Brand",
          name: "Fashion Store",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.0",
          reviewCount: "122",
        },
      }
    : null;

  const productimage = getProductimage();
  const productSizes = getProductSizes();
  const currentimage = productimage[currentimageIndex];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return productData ? (
    <div className="px-4 pt-10 transition-opacity ease-in duration-500 opacity-100 relative">
      {/* Structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(productStructuredData)}
      </script>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all animate-fadeInOut">
          Added to cart!
        </div>
      )}

      {/* Login Prompt Notification */}
      {showLoginPrompt && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 transition-all animate-fadeInOut">
          Please login to add items to cart. Redirecting to login...
        </div>
      )}

      {/* Product Data */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Product image */}
        <div className="flex-1 flex flex-col-reverse gap-4 sm:flex-row">
          {/* Thumbnails Column */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-[120px] pb-2 sm:pb-0">
            {productimage.map((item, index) => (
              <img
                onClick={() => setCurrentimageIndex(index)}
                src={item}
                key={index}
                className={`w-1/4 sm:w-full aspect-square object-cover cursor-pointer border-2 transition-all
                  ${
                    currentimageIndex === index
                      ? "border-black"
                      : "border-transparent hover:border-gray-300"
                  }`}
                alt={`${productData.name} - View ${index + 1}`}
                loading="eager"
                width="120"
                height="120"
              />
            ))}
          </div>

          {/* Main image with Slider */}
          <div className="w-full sm:w-[calc(100%-136px)] relative">
            <div className="relative w-full aspect-rectangle overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={currentimage}
                alt={productData.name}
                width="500"
                height="500"
                loading="eager"
              />

              {/* Navigation Arrows - Only show if multiple image */}
              {productimage.length > 1 && (
                <>
                  {/* Left Arrow */}
                  <button
                    onClick={previmage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {/* Right Arrow */}
                  <button
                    onClick={nextimage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* image Counter */}
              {productimage.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentimageIndex + 1} / {productimage.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex item-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.stardull_icon} alt="" className="w-3 5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium text-green-600">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:4/5">{productData.description}</p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productSizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 transition-all ${
                    item === size
                      ? "border-blue-500 text-blue-500 bg-blue-100"
                      : "border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!size}
            className={`bg-black text-white px-8 py-3 text-sm ${
              !size ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original Product.</p>
            <p>Cash on delivery is available for this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Display related Products */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
        currentProductId={productData._id}
      />
    </div>
  ) : (
    <div className="text-center py-12">
      <p className="text-gray-500">Product not found</p>
    </div>
  );
};

export default Product;
