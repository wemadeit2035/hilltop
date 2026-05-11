/**
 * Mobile detection middleware
 * Detects mobile devices and adds client information to request
 */
export const detectMobile = (req, res, next) => {
  const userAgent = req.headers["user-agent"] || "";
  const clientType = req.headers["x-client-type"] || "";

  // Mobile detection
  const isMobile =
    /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );

  // Set request properties
  req.isMobile = isMobile;
  req.clientType = clientType || (isMobile ? "mobile-web" : "desktop");
  req.userAgent = userAgent;

  // Add mobile headers to response
  res.set("X-Client-Type", req.clientType);
  res.set("X-Mobile-Device", isMobile.toString());

  next();
};

export default detectMobile;
