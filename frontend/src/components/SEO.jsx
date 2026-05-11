// components/SEO.jsx
import React, { useEffect } from "react";

const SEO = ({
  title,
  description,
  keywords,
  path,
  image,
  type = "website",
  noindex = false,
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const fullUrl = `${siteUrl}${path || ""}`;
  const defaultImage = `${siteUrl}/images/og-image.jpg`;

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.name = name;
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    const updatePropertyTag = (property, content) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = content;
    };

    // Basic meta tags
    if (description) updateMetaTag("description", description);
    if (keywords) updateMetaTag("keywords", keywords);

    if (noindex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Open Graph tags
    if (title) updatePropertyTag("og:title", title);
    if (description) updatePropertyTag("og:description", description);
    updatePropertyTag("og:url", fullUrl);
    updatePropertyTag("og:type", type);
    updatePropertyTag("og:image", image || defaultImage);
    updatePropertyTag("og:site_name", "Fashion Store");

    // Twitter Card tags
    updatePropertyTag("twitter:card", "summary_large_image");
    if (title) updatePropertyTag("twitter:title", title);
    if (description) updatePropertyTag("twitter:description", description);
    updatePropertyTag("twitter:image", image || defaultImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;
  }, [
    title,
    description,
    keywords,
    path,
    image,
    type,
    noindex,
    siteUrl,
    fullUrl,
    defaultImage,
  ]);

  return null;
};

export default SEO;
