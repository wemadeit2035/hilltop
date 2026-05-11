import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom"; // ADDED: useNavigate hook
import Title from "../components/Title";
import { Trash2, Plus, Minus } from "lucide-react";
import CartTotal from "../components/CartTotal";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateCartQuantity, // CHANGED: updateCartQuantity not updateQuantity
    removeFromCart, // CHANGED: removeFromCart not deleteFromCart
  } = useContext(ShopContext);

  const navigate = useNavigate(); // ADDED: useNavigate hook

  const [cartData, setCartData] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [removingItem, setRemovingItem] = useState(null);

  useEffect(() => {
    let total = 0;
    const tempData = [];

    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        const quantity = cartItems[productId][size];
        if (quantity > 0) {
          const product = products.find((p) => p._id === productId);
          if (product) {
            const itemTotal = product.price * quantity;
            total += itemTotal;

            // Handle both array and string image formats
            let productImage = "";
            if (Array.isArray(product.image) && product.image.length > 0) {
              productImage = product.image[0];
            } else if (typeof product.image === "string") {
              productImage = product.image;
            } else {
              productImage =
                "https://placehold.co/112x112/cccccc/969696?text=Product+Image";
            }

            tempData.push({
              id: productId,
              size,
              quantity,
              unitPrice: product.price,
              total: itemTotal,
              name: product.name,
              image: productImage,
              color: product.color,
            });
          }
        }
      }
    }

    setCartData(tempData);
    setSubtotal(total);
  }, [cartItems, products]);

  const handleQuantityChange = (item, newQuantity) => {
    updateCartQuantity(item.id, item.size, newQuantity);
  };

  const handleRemoveItem = (item) => {
    setRemovingItem(`${item.id}-${item.size}`);
    setTimeout(() => {
      removeFromCart(item.id, item.size);
      setRemovingItem(null);
    }, 300);
  };

  // Add structured data for cart page SEO
  const cartStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Shopping Cart",
    description: "Review your fashion items before checkout",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shopping Cart",
          item: `${window.location.origin}/cart`,
        },
      ],
    },
  };

  return (
    <div className="pt-14 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(cartStructuredData)}
      </script>

      <div className="mb-12">
        <Title text1={"SHOPPING"} text2={"CART"} className="text-3xl" />
      </div>

      {!cartData.length ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-100 p-8 rounded-full mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-xl font-light mb-8">Your cart is empty</p>
          <button
            onClick={() => navigate("/collection")}
            className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all duration-300 tracking-wider"
            aria-label="Continue shopping to browse our collection"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          {/* Cart Header */}
          <div
            className="hidden md:grid grid-cols-12 gap-6 pb-4 border-b border-gray-200 uppercase text-xs tracking-wider text-gray-500 mb-2"
            role="row"
            aria-label="Cart column headers"
          >
            <div className="col-span-5" role="columnheader">
              Product
            </div>
            <div className="col-span-3 text-center" role="columnheader">
              Quantity
            </div>
            <div className="col-span-4 text-right" role="columnheader">
              Total
            </div>
          </div>

          {/* Cart Items */}
          <div className="mb-16" role="list" aria-label="Shopping cart items">
            {cartData.map((item) => {
              const isRemoving = removingItem === `${item.id}-${item.size}`;

              return (
                <div
                  key={`${item.id}-${item.size}`}
                  className={`py-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-300 ${
                    isRemoving
                      ? "opacity-0 h-0 py-0 overflow-hidden"
                      : "opacity-100"
                  }`}
                  role="listitem"
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  {/* Product Info */}
                  <div className="flex gap-6 col-span-5">
                    <div className="relative">
                      <img
                        className="w-28 h-28 object-cover rounded-lg shadow-sm border border-gray-100"
                        src={item.image}
                        alt={item.name}
                        width="112"
                        height="112"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/112x112/cccccc/969696?text=Product+Image";
                          e.target.onerror = null;
                        }}
                        itemProp="image"
                      />
                      {item.color && (
                        <div
                          className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: item.color }}
                          aria-label={`Color: ${item.color}`}
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-lg mb-1" itemProp="name">
                        {item.name}
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-gray-700 font-medium">
                          {currency}
                          {item.unitPrice?.toFixed(2)}
                        </span>
                        {item.size && item.size !== "undefined" && (
                          <span
                            className="text-xs text-blue-600 border border-blue-600 bg-blue-200 rounded-full px-2.5 py-1"
                            aria-label={`Size: ${item.size}`}
                          >
                            {item.size.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-center col-span-3">
                    <div
                      className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm"
                      role="group"
                      aria-label={`Quantity controls for ${item.name}`}
                    >
                      <button
                        onClick={() =>
                          handleQuantityChange(item, item.quantity - 1)
                        }
                        className="px-3 py-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        disabled={item.quantity <= 1}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus
                          size={16}
                          className="text-gray-600"
                          aria-hidden="true"
                        />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={item.quantity}
                        onChange={(e) => {
                          const value = Math.max(
                            1,
                            Math.min(10, Number(e.target.value))
                          );
                          handleQuantityChange(item, value);
                        }}
                        className="w-12 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent"
                        aria-label={`Current quantity: ${item.quantity}`}
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item, item.quantity + 1)
                        }
                        className="px-3 py-2 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        disabled={item.quantity >= 10}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus
                          size={16}
                          className="text-gray-600"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex items-center justify-end gap-6 col-span-4">
                    <p className="font-medium text-lg">
                      {currency}
                      {item.total?.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="text-red-400 hover:text-red-500 cursor-pointer transition-colors"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Section */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 py-6 -mx-4 px-4 sm:-mx-6 sm:px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <div className="max-w-5xl mx-auto">
              <CartTotal />
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
                <button
                  onClick={() => navigate("/collection")}
                  className="border border-black py-3 px-8 hover:bg-gray-50 transition-colors"
                  aria-label="Continue shopping"
                >
                  CONTINUE SHOPPING
                </button>
                <button
                  onClick={() => navigate("/place-order")}
                  className="bg-black text-white py-3 px-8 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                  aria-label="Proceed to checkout"
                >
                  PROCEED TO CHECKOUT
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Cart);
