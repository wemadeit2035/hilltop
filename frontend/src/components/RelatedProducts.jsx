import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ category, subCategory, currentProductId }) => {
  const { products, getProductsData } = useContext(ShopContext); // CHANGED: fetchProducts → getProductsData
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedProducts = async () => {
      try {
        setLoading(true);

        // If no products, fetch them first
        if (!products || products.length === 0) {
          await getProductsData(); // CHANGED: fetchProducts → getProductsData
          return;
        }

        // If no category or subCategory, don't show related products
        if (!category || !subCategory) {
          setRelated([]);
          setLoading(false);
          return;
        }

        // Filter products by same category and subCategory, exclude current product
        const filteredProducts = products.filter((item) => {
          if (!item || !item._id) return false;

          const matchesCategory = item.category === category;
          const matchesSubCategory = item.subCategory === subCategory;
          const isNotCurrentProduct = item._id !== currentProductId;

          return matchesCategory && matchesSubCategory && isNotCurrentProduct;
        });

        setRelated(filteredProducts.slice(0, 100));
      } catch (error) {
        console.error("Error loading related products:", error);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedProducts();
  }, [products, category, subCategory, currentProductId, getProductsData]); // CHANGED: Added getProductsData to dependencies

  if (loading) {
    return (
      <div className="my-20">
        <div className="text-center text-3xl py-2">
          <Title text1={"RELATED"} text2={"PRODUCTS"} />
        </div>
        <div className="text-center py-8">
          <p>Loading related products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-20">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      {related.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
          {related.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={Array.isArray(item.image) ? item.image[0] : item.image}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No related products found</p>
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
