import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets"; // Import your assets

const ProductItem = ({ id, image, name, price, bestseller, unitsSold }) => {
  const { currency } = useContext(ShopContext);
  const [imageLoaded, setimageLoaded] = useState(false);
  const [imageError, setimageError] = useState(false);

  // Check if product is auto bestseller (20+ units sold)
  const isAutoBestseller = unitsSold >= 20;
  const showBestsellerBadge = bestseller || isAutoBestseller;

  // Safely get the image URL
  const getimageUrl = () => {
    if (Array.isArray(image) && image.length > 0) {
      return image[0];
    }
    if (typeof image === "string") {
      return image;
    }
    return "https://via.placeholder.com/300x300/cccccc/969696?text=No+image";
  };

  const imageUrl = getimageUrl();

  return (
    <Link
      className="text-white bg-black cursor-pointer block relative group"
      to={`/product/${id}`}
      itemScope
      itemType="https://schema.org/Product"
      aria-label={`View ${name} product details`}
    >
      {/* Simple Bestseller Badge - Icon Only */}
      {showBestsellerBadge && (
        <div className="absolute top-2 right-2 z-10">
          <div className="p-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 shadow-lg">
            <img src={assets.star_icon} alt="Bestseller" className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="overflow-hidden relative">
        <img
          className="hover:scale-110 transition ease-in-out duration-300 w-full aspect-rectangle object-cover"
          src={imageUrl}
          alt={name}
          width="300"
          height="300"
          onLoad={() => setimageLoaded(true)}
          onError={(e) => {
            setimageError(true);
            e.target.src =
              "https://via.placeholder.com/300x300/cccccc/969696?text=image+Error";
          }}
          itemProp="image"
        />
      </div>

      {/* UPDATED: Product details with consistent height */}
      <div className="bg-black min-h-[50px] flex flex-col justify-center">
        <p className="px-4 text-sm mt-2 truncate" itemProp="name">
          {name}
        </p>
        <p
          className="text-sm px-4 font-medium text-green-400 mb-2"
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
        >
          <span itemProp="priceCurrency" content="ZAR">
            {currency}
          </span>
          <span itemProp="price" content={price}>
            {price}
          </span>
        </p>
      </div>

      {/* Hidden structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: name,
          image: imageUrl,
          offers: {
            "@type": "Offer",
            price: price,
            priceCurrency: "ZAR",
          },
        })}
      </script>
    </Link>
  );
};

export default ProductItem;
