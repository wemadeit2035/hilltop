import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Title from "../components/Title";
import assets from "../assets/assets";
import NewsletterBox from "../components/NewsLetterBox.jsx";
import L from "leaflet";
import axios from "axios";

// Fix for default markers in react-leaflet
import "leaflet/dist/leaflet.css";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Your coordinates
  const position = [-26.1088, 28.0527];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/contact`,
        formData,
      );

      if (response.data.success) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Structured data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Us - Finezto Fashion",
          description:
            "Get in touch with Finezto Fashion. Visit our store, contact us by phone or email, or send us a message.",
          mainEntity: {
            "@type": "Store",
            name: "Finezto Flagship Store",
            address: {
              "@type": "PostalAddress",
              streetAddress: "123 Fashion District",
              addressLocality: "Johannesburg",
              addressCountry: "South Africa",
            },
            telephone: "+27 11 555 0123",
            email: "admin@finezto.com",
            openingHours: ["Mo-Fr 09:00-20:00", "Sa-Su 10:00-18:00"],
          },
        })}
      </script>

      {/* Hero Section with Background Image */}
      <section
        className="relative py-16 sm:py-20 md:py-24 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${assets.contact_image})` }}
        aria-labelledby="contact-heading"
      >
        <div
          className="absolute inset-0 bg-black opacity-60"
          aria-hidden="true"
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block text-2xl sm:text-3xl md:text-4xl">
            <Title
              text1={"GET IN TOUCH"}
              text2={"WITH US"}
              className="text-white"
            />
          </div>
          <h1 id="contact-heading" className="sr-only">
            Contact Finezto Fashion
          </h1>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-100 max-w-3xl mx-auto px-2">
            We'd love to hear from you. Our team is always ready to connect and
            assist you.
          </p>
          <div className="mt-4 sm:mt-6 flex justify-center" aria-hidden="true">
            <div className="w-12 sm:w-16 h-0.5 sm:h-1 bg-green-500"></div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Contact Information */}
          <div className="space-y-6 sm:space-y-8">
            <section aria-labelledby="information-heading">
              <h2
                id="information-heading"
                className="text-xl sm:text-2xl font-serif font-light text-gray-800 mb-4"
              >
                Our Information
              </h2>

              <div className="space-y-4 sm:space-y-6" role="list">
                <div className="flex items-start" role="listitem">
                  <div
                    className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-green-50 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 11111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      Our Store
                    </h3>
                    <address className="mt-1 text-gray-600 text-xs sm:text-sm not-italic">
                      123 Fashion District,
                      <br />
                      Johannesburg, South Africa
                    </address>
                  </div>
                </div>

                <div className="flex items-start" role="listitem">
                  <div
                    className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-green-50 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      Contact Details
                    </h3>
                    <div className="mt-1 text-gray-600 text-xs sm:text-sm">
                      <p>
                        Tel:{" "}
                        <a
                          href="tel:+27115550123"
                          className="hover:text-green-600 transition-colors"
                        >
                          +27 11 555 0123
                        </a>
                      </p>
                      <p>
                        Email:{" "}
                        <a
                          href="mailto:admin@finezto.com"
                          className="hover:text-green-600 transition-colors"
                        >
                          admin@finezto.com
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start" role="listitem">
                  <div
                    className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-green-50 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900">
                      Store Hours
                    </h3>
                    <p className="mt-1 text-gray-600 text-xs sm:text-sm">
                      Monday-Friday: 9am - 8pm
                      <br />
                      Saturday-Sunday: 10am - 6pm
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Form */}
          <section
            className="bg-gray-50 rounded-xl p-4 sm:p-6"
            aria-labelledby="contact-form-heading"
          >
            <h2
              id="contact-form-heading"
              className="text-xl sm:text-2xl font-serif font-light text-gray-800 mb-4"
            >
              Send Us a Message
            </h2>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div
                className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm"
                role="alert"
              >
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {submitStatus === "error" && (
              <div
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-xs sm:text-sm"
                role="alert"
              >
                Sorry, there was an error sending your message. Please try again
                or contact us directly at admin@finezto.com.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm focus:outline-none"
                  placeholder="Your full name"
                  required
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm focus:outline-none"
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                  aria-required="true"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm focus:outline-none"
                  placeholder="How can we help you?"
                  required
                  disabled={isSubmitting}
                  aria-required="true"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-2 px-4 rounded-lg transition-colors duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
                aria-label={isSubmitting ? "Sending message" : "Send message"}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>
        </div>

        {/* Map Section - Side by side on all screens */}
        <section
          className="mt-8 sm:mt-12 md:mt-16"
          aria-labelledby="map-heading"
        >
          <h2 id="map-heading" className="sr-only">
            Our Location
          </h2>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Map Container */}
              <div className="h-64 sm:h-80 md:h-96">
                <MapContainer
                  center={position}
                  zoom={13}
                  style={{ height: "100%", width: "100%", zIndex: 1 }}
                  scrollWheelZoom={false}
                  aria-label="Interactive map showing Finezto store location"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      Finezto Flagship Store <br /> 123 Fashion District,
                      Johannesburg, SA
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Store Info */}
              <div className="p-4 sm:p-6 bg-black text-white flex flex-col justify-center">
                <h3 className="text-lg sm:text-xl font-serif mb-3">
                  Visit Our Flagship Store
                </h3>
                <p className="mb-4 text-xs sm:text-sm text-gray-300">
                  Experience the complete Finezto collection in our beautifully
                  designed retail space where our experts will help you find
                  exactly what you're looking for.
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 11111.314 0z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                    <span className="break-words">
                      123 Fashion District, Johannesburg, South Africa
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>Mon-Fri: 9am-8pm | Sat-Sun: 10am-6pm</span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      ></path>
                    </svg>
                    <span>
                      <a
                        href="tel:+27115550123"
                        className="hover:text-green-400 transition-colors"
                      >
                        +27 11 555 0123
                      </a>
                    </span>
                  </div>
                </div>
                <button
                  className="mt-4 sm:mt-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs sm:text-sm transition-colors w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        "123 Fashion District, Johannesburg, South Africa",
                      )}`,
                    )
                  }
                  aria-label="Get directions to our store"
                >
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <NewsletterBox />
    </div>
  );
};

export default Contact;
