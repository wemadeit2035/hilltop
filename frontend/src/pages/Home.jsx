import React from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsLetterBox from "../components/NewsLetterBox";
import SEO from "../components/SEO";

const Home = () => {
  return (
    <>
      <SEO
        title="Finezto - Latest Collections & Trends"
        description="Discover the latest fashion trends, new arrivals, and best-selling clothing. Shop premium quality apparel with easy returns and great customer support."
        keywords="fashion, clothing, new arrivals, bestsellers, trendy clothes, online shopping"
        path="/"
      />

      <main role="main">
        <Hero />
        <section
          id="latestCollection"
          aria-labelledby="latest-collection-heading"
        >
          <LatestCollection />
        </section>
        <section
          className="px-4"
          id="bestsellers"
          aria-labelledby="bestsellers-heading"
        >
          <BestSeller />
        </section>
        <OurPolicy />
        <NewsLetterBox />
      </main>
    </>
  );
};

export default Home;
