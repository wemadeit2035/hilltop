import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fashion Store",
    url: window.location.origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${window.location.origin}/collection?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goToCollection = () => {
    navigate("/collection");
  };

  const goToSection = (sectionId) => {
    if (window.location.pathname !== "/") {
      navigate("/");
    } else {
      scrollToSection(sectionId);
    }
  };

  React.useEffect(() => {
    const scrollTarget = new URLSearchParams(window.location.search).get(
      "scrollTo"
    );
    if (scrollTarget) {
      setTimeout(() => scrollToSection(scrollTarget), 100);
    }
  }, []);

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <section
        className="flex flex-col sm:flex-row border border-gray-400"
        aria-label="Hero Section - New Arrivals Fashion Collection"
        itemScope
        itemType="https://schema.org/WPAdBlock"
      >
        <div className="w-full sm:w-1/2 flex bg-white items-center justify-center py-10 sm:py-0">
          <div className="text-[#414141]">
            <button
              onClick={() => goToSection("bestsellers")}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="View Best Selling Products"
            >
              <span className="w-8 md:w-11 h-[2px] bg-[#414141] group-hover:w-12 transition-all"></span>
              <span className="font-medium text-sm md:text-base group-hover:font-semibold transition-all">
                BESTSELLERS
              </span>
            </button>

            <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed block cursor-pointer hover:font-bold transition-all">
              NEW ARRIVALS
            </h1>

            <button
              onClick={goToCollection}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="Shop Now - Browse Full Collection"
            >
              <span className="font-semibold text-sm md:text-base group-hover:font-bold transition-all">
                SHOP NOW
              </span>
              <span className="w-8 md:w-11 h-[2px] bg-[#414141] group-hover:w-12 transition-all"></span>
            </button>
          </div>
        </div>

        <img
          className="w-full sm:w-1/2"
          src={assets.hero_img}
          alt="Latest fashion collection - New arrivals and trendy clothing items"
          itemProp="image"
          loading="eager"
          width="800"
          height="600"
        />
      </section>
    </>
  );
};

export default Hero;
