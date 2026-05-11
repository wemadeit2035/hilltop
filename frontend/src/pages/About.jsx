import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import NewsletterBox from "../components/NewsLetterBox.jsx";
import assets from "../assets/assets";
import Title from "../components/Title";
import FAQ from "../components/FAQ.jsx";

const About = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#faq") {
      const faqElement = document.getElementById("faq-section");
      if (faqElement) {
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          faqElement.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="overflow-hidden">
      {/* Structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Our Fashion Journey",
          description:
            "Crafting style narratives since 2012. Learn about our fashion brand story, mission, and core values.",
          publisher: {
            "@type": "Organization",
            name: "Fashion Store",
            description: "Premium fashion retailer",
          },
        })}
      </script>

      {/* Hero Section */}
      <section
        className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 to-black overflow-hidden"
        aria-labelledby="about-heading"
      >
        <div className="absolute inset-0 z-0 opacity-20" aria-hidden="true">
          <div
            className="absolute top-0 left-0 w-full h-full bg-gray-800"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1
            id="about-heading"
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light text-white mb-3 sm:mb-4"
          >
            About Our Fashion Journey
          </h1>
          <div
            className="w-16 sm:w-20 h-0.5 sm:h-1 bg-green-500 mx-auto mb-3 sm:mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 opacity-90 mb-4 sm:mb-6 max-w-2xl mx-auto font-light px-2">
            Crafting style narratives since 2012
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section
        className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 relative"
        aria-labelledby="story-heading"
      >
        {/* Premium decorative elements - removed animations that cause shaking */}
        <div
          className="absolute top-8 sm:top-16 -left-4 sm:-left-8 w-40 sm:w-60 h-40 sm:h-60 bg-green-100 mix-blend-multiply filter blur-xl opacity-5"
          aria-hidden="true"
        ></div>
        <div
          className="absolute top-48 sm:top-80 -right-4 sm:-right-8 w-40 sm:w-60 h-40 sm:h-60 bg-amber-100 mix-blend-multiply filter blur-xl opacity-5"
          aria-hidden="true"
        ></div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
            <div className="w-full md:w-1/2 relative order-2 md:order-1">
              <div className="relative overflow-hidden shadow-lg group">
                <img
                  src={assets.about_image}
                  alt="Our fashion team working on designs"
                  className="w-full h-auto object-cover"
                  width="600"
                  height="400"
                  loading="eager"
                />
                <div
                  className="absolute inset-0 border border-white border-opacity-20 pointer-events-none"
                  aria-hidden="true"
                ></div>
              </div>
            </div>

            <div className="w-full md:w-1/2 order-1 md:order-2">
              <div className="text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">
                <Title text1={"OUR"} text2={"STORY"} />
              </div>
              <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed font-light text-sm sm:text-base">
                What began as a small boutique in downtown Seattle has blossomed
                into a nationwide phenomenon. Founded by fashion enthusiast
                Maria Sanchez, we've stayed true to our core belief:
                <span className="font-normal text-green-600 italic block mt-2 pl-3 border-l-2 border-green-200">
                  Fashion should empower, not intimidate.
                </span>
              </p>

              <div
                className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6"
                role="list"
                aria-label="Company achievements"
              >
                <div
                  className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 shadow-sm border border-gray-100"
                  role="listitem"
                >
                  <div className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-1">
                    12+
                  </div>
                  <div className="text-gray-600 text-xs uppercase tracking-widest font-medium">
                    Years
                  </div>
                </div>
                <div
                  className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 shadow-sm border border-gray-100"
                  role="listitem"
                >
                  <div className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-1">
                    101+
                  </div>
                  <div className="text-gray-600 text-xs uppercase tracking-widest font-medium">
                    Sales
                  </div>
                </div>
                <div
                  className="text-center p-2 sm:p-3 md:p-4 bg-gray-50 shadow-sm border border-gray-100"
                  role="listitem"
                >
                  <div className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900 mb-1">
                    75+
                  </div>
                  <div className="text-gray-600 text-xs uppercase tracking-widest font-medium">
                    Awards
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section
        className="py-8 sm:py-12 md:py-16 relative overflow-hidden"
        aria-labelledby="mission-heading"
      >
        <div
          className="absolute -bottom-16 sm:-bottom-32 -right-16 sm:-right-32 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-green-100 mix-blend-multiply filter blur-xl opacity-5"
          aria-hidden="true"
        ></div>
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center relative">
          <div
            className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white mb-3 sm:mb-4 rounded-full shadow-sm border border-gray-100"
            aria-hidden="true"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <h2
            id="mission-heading"
            className="text-xl sm:text-2xl font-serif font-light text-gray-800 mb-3 sm:mb-4 tracking-wide"
          >
            Our Mission
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed font-light text-sm sm:text-base px-2">
            To redefine fashion retail by creating an inclusive environment
            where everyone can discover their unique style, with
            sustainably-made garments that don't compromise on quality or
            design.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section
        className="py-8 sm:py-12 md:py-16 relative"
        aria-labelledby="values-heading"
      >
        <div
          className="absolute top-1/4 sm:top-1/3 -left-8 sm:-left-16 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-amber-50 mix-blend-multiply filter blur-xl opacity-10"
          aria-hidden="true"
        ></div>

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">
              <Title text1={"CORE"} text2={"VALUES"} />
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto font-light text-xs sm:text-sm px-2">
              These principles guide everything we do, from design to customer
              experience
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            role="list"
            aria-label="Core values"
          >
            <div
              className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 text-center transition-all duration-300 hover:shadow-md"
              role="listitem"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-50 rounded-full mb-3 sm:mb-4 transition-colors duration-300"
                aria-hidden="true"
              >
                <img
                  src={assets.exchange_icon}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                  alt="Easy Exchange Policy"
                  width="32"
                  height="32"
                  loading="lazy"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 tracking-wide">
                Easy Exchange Policy
              </h3>
              <p className="text-gray-600 font-light text-xs sm:text-sm">
                We offer hassle-free exchange policy because we want you to love
                what you wear
              </p>
            </div>

            <div
              className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 text-center transition-all duration-300 hover:shadow-md"
              role="listitem"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-50 rounded-full mb-3 sm:mb-4 transition-colors duration-300"
                aria-hidden="true"
              >
                <img
                  src={assets.quality_icon}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                  alt="7 Days Return Policy"
                  width="32"
                  height="32"
                  loading="lazy"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 tracking-wide">
                7 Days Return Policy
              </h3>
              <p className="text-gray-600 font-light text-xs sm:text-sm">
                We provide 7 days free return policy on all items, no questions
                asked
              </p>
            </div>

            <div
              className="bg-white p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 text-center transition-all duration-300 hover:shadow-md"
              role="listitem"
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-50 rounded-full mb-3 sm:mb-4 transition-colors duration-300"
                aria-hidden="true"
              >
                <img
                  src={assets.support_icon}
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                  alt="Premium Customer Support"
                  width="32"
                  height="32"
                  loading="lazy"
                />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 tracking-wide">
                Premium Customer Support
              </h3>
              <p className="text-gray-600 font-light text-xs sm:text-sm">
                Our dedicated team provides 24/7 customer support to ensure your
                satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id="faq-section">
        <FAQ />
      </div>

      <NewsletterBox />
    </div>
  );
};

export default About;
