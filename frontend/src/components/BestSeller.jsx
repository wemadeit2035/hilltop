import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    const bestProducts = products.filter((item) => item.bestseller);
    setBestSellers(bestProducts.slice(0, 12));
  }, [products]);

  // Structured data for bestsellers
  const bestsellerStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Best Selling Fashion Items",
    description:
      "Explore our most popular and loved fashion pieces that customers can't stop buying",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: bestSellers.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          image: product.image,
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "USD",
          },
          url: `${window.location.origin}/product/${product._id}`,
        },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(bestsellerStructuredData)}
      </script>

      <section
        className="my-10"
        itemScope
        itemType="https://schema.org/ItemList"
      >
        <div className="text-center text-3x1 py-8">
          <Title text1={"BEST"} text2={"SELLERS"} />
          <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
            Explore our most popular and loved fashion pieces that customers
            can't stop buying. These bestsellers represent the highest quality
            and most trendy items in our collection.
          </p>
        </div>

        <meta itemProp="numberOfItems" content={bestSellers.length} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 sm:px-6 lg:px-8">
          {bestSellers.map((item, index) => (
            <div
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              key={item._id}
            >
              <meta itemProp="position" content={index + 1} />
              <ProductItem
                key={item._id}
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default BestSeller;
