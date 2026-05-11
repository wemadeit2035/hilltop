import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = useState("privacy");
  const location = useLocation();

  useEffect(() => {
    // Handle URL hash for direct linking
    if (window.location.hash === "#terms") {
      setActiveTab("terms");
    } else if (window.location.hash === "#privacy") {
      setActiveTab("privacy");
    }
  }, [location.hash]);

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-2xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-gray-200">
        <h1 className="text-4xl font-semibold bg-gradient-to-r from-teal-800 to-blue-800 bg-clip-text text-transparent mb-2">
          🛍️ Finezto
        </h1>
        <div className="flex items-center gap-2 text-gray-600 text-lg">
          <i className="fas fa-shield-alt text-blue-500 text-xl"></i>
          <span>Your privacy & our commitment — clear, fair, human.</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
          <i className="far fa-calendar-alt text-blue-500"></i>
          Last updated: 11 March 2026
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex bg-gray-100 mx-8 mt-6 rounded-full p-1 w-fit border border-gray-200">
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
            activeTab === "privacy"
              ? "bg-white text-blue-900 shadow-md"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("privacy")}
        >
          <i className="fas fa-lock"></i>
          Privacy Policy
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
            activeTab === "terms"
              ? "bg-white text-blue-900 shadow-md"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("terms")}
        >
          <i className="fas fa-file-contract"></i>
          Terms of Service
        </button>
      </div>

      {/* Content Panels */}
      <div className="p-8">
        {/* Privacy Policy Panel */}
        {activeTab === "privacy" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-3 flex items-center gap-3">
              <i className="fas fa-user-shield text-blue-600"></i>
              Privacy Policy
            </h2>

            <p className="text-gray-700">
              At <span className="font-semibold">Finezto</span>, we value the
              trust you place in us. This Privacy Policy explains how we
              collect, use, and protect your personal information when you shop
              on our MERN-powered store. By using our website, you agree to the
              practices described below.
            </p>

            {/* Section 1 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-database text-blue-600 w-6"></i>
                1. Information we collect
              </h3>
              <p className="text-gray-700 mb-3 font-medium">
                When you browse, create an account, or make a purchase, we may
                collect:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Identity data:</span> name,
                  email address, phone number, shipping/billing address.
                </li>
                <li>
                  <span className="font-semibold">Payment data:</span>{" "}
                  credit/debit card details, UPI, or PayPal (processed directly
                  by secure gateways – we never store full payment credentials).
                </li>
                <li>
                  <span className="font-semibold">Profile data:</span> username,
                  password, order history, preferences (e.g., size, favorite
                  styles).
                </li>
                <li>
                  <span className="font-semibold">Technical data:</span> IP
                  address, browser type, device info, and cookies (see section
                  5).
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-cogs text-blue-600 w-6"></i>
                2. How we use your information
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">To fulfill orders:</span>{" "}
                  process payments, ship products, and send order updates.
                </li>
                <li>
                  <span className="font-semibold">
                    To improve your experience:
                  </span>{" "}
                  personalise product recommendations and remember your cart.
                </li>
                <li>
                  <span className="font-semibold">To communicate:</span> respond
                  to support requests, send offers (only if you opt in).
                </li>
                <li>
                  <span className="font-semibold">To prevent fraud:</span>{" "}
                  verify transactions and maintain security.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-share-alt text-blue-600 w-6"></i>
                3. Sharing & disclosure
              </h3>
              <p className="text-gray-700 mb-3">
                We never sell your personal data. We only share necessary
                information with:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Service providers:</span>{" "}
                  shipping partners (Delhivery, FedEx), payment gateways
                  (Razorpay, Stripe), and email/SMS platforms (only to perform
                  services).
                </li>
                <li>
                  <span className="font-semibold">Legal compliance:</span> if
                  required by law or to protect our rights.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-cookie-bite text-blue-600 w-6"></i>
                4. Cookies & tracking
              </h3>
              <p className="text-gray-700">
                Our store uses cookies to keep you logged in, remember cart
                items, and analyse traffic. You can disable cookies in your
                browser, but some features may not work properly. We also use
                Google Analytics to understand anonymised usage patterns.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-lock text-blue-600 w-6"></i>
                5. Data security
              </h3>
              <p className="text-gray-700">
                We implement HTTPS, encrypted databases, and regular security
                audits. Passwords are hashed (bcrypt) and payment details are
                tokenized. However, no online transmission is 100% secure – you
                share information at your own risk.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-user-edit text-blue-600 w-6"></i>
                6. Your rights
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  Access, update, or delete your account info anytime via
                  profile settings.
                </li>
                <li>
                  Opt out of marketing emails (unsubscribe link in every email).
                </li>
                <li>
                  Request a copy of your data by contacting{" "}
                  <a
                    href="mailto:privacy@finezto.store"
                    className="text-blue-600 hover:underline"
                  >
                    privacy@finezto.store
                  </a>
                  .
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-globe text-blue-600 w-6"></i>
                7. International transfer
              </h3>
              <p className="text-gray-700">
                If you access our store from outside India, your data may be
                transferred to and stored on servers located in India or other
                countries where our cloud infrastructure (MongoDB Atlas, AWS)
                operates. By using our services, you consent to this transfer.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-child text-blue-600 w-6"></i>
                8. Children's privacy
              </h3>
              <p className="text-gray-700">
                Finezto does not knowingly collect data from individuals under
                13. If you believe a child has provided information, contact us
                and we will delete it.
              </p>
            </section>

            {/* Legal Note */}
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600 mt-8">
              <i className="fas fa-envelope-open-text text-blue-600 mr-2"></i>
              <span className="font-semibold">Privacy questions?</span> Reach
              our Data Protection Officer:{" "}
              <a
                href="mailto:dpo@finezto.store"
                className="text-blue-600 hover:underline"
              >
                dpo@finezto.store
              </a>{" "}
              or write to us at 17B, Silk Road Avenue, Bangalore – 560001.
            </div>
          </div>
        )}

        {/* Terms of Service Panel */}
        {activeTab === "terms" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-3 flex items-center gap-3">
              <i className="fas fa-file-signature text-blue-600"></i>
              Terms of Service
            </h2>

            <p className="text-gray-700">
              Welcome to Finezto! By accessing or purchasing from our online
              store, you agree to be bound by these Terms. Please read them
              carefully. If you do not agree, please refrain from using our
              services.
            </p>

            {/* Terms sections */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-store-alt text-blue-600 w-6"></i>
                1. Account & eligibility
              </h3>
              <p className="text-gray-700">
                You must be at least 18 years old (or have parental consent) to
                create an account. You are responsible for maintaining the
                confidentiality of your login credentials. Notify us immediately
                of any unauthorised use.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-tag text-blue-600 w-6"></i>
                2. Products, pricing & availability
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  We strive to display accurate colours and details, but slight
                  variations may occur.
                </li>
                <li>
                  Prices are listed in INR (₹) and inclusive of applicable taxes
                  unless stated otherwise.
                </li>
                <li>
                  We reserve the right to modify prices, discontinue items, or
                  limit quantities (e.g., per customer).
                </li>
                <li>
                  In case of a pricing error, we may cancel the order with full
                  refund.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-credit-card text-blue-600 w-6"></i>
                3. Payment & checkout
              </h3>
              <p className="text-gray-700">
                All payments are processed through third-party gateways
                (Razorpay/Stripe). By placing an order, you authorise us to
                charge your selected method. We do not store payment card
                numbers. Cash on Delivery (COD) may be available for eligible
                locations.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-truck text-blue-600 w-6"></i>
                4. Shipping & delivery
              </h3>
              <p className="text-gray-700">
                Estimated delivery times are provided at checkout. Risk of loss
                passes to you upon delivery. Finezto is not responsible for
                delays caused by customs, carriers, or incorrect addresses. For
                any shipping disputes, contact{" "}
                <a
                  href="mailto:orders@finezto.store"
                  className="text-blue-600 hover:underline"
                >
                  orders@finezto.store
                </a>
                .
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-undo-alt text-blue-600 w-6"></i>
                5. Returns & exchanges
              </h3>
              <p className="text-gray-700">
                We accept returns within{" "}
                <span className="font-semibold">15 days</span> of delivery,
                provided the item is unworn, unwashed, and with tags. To
                initiate a return, visit your order history. Refunds are
                processed to the original payment method within 7 business days
                after inspection. Final sale items are non-returnable.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-copyright text-blue-600 w-6"></i>
                6. Intellectual property
              </h3>
              <p className="text-gray-700">
                All content on this site — including images, logos, text, and
                MERN stack code — is owned by Finezto or our licensors. You may
                not reproduce, distribute, or exploit any material without
                written permission.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-ban text-blue-600 w-6"></i>
                7. Prohibited conduct
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  Using bots, scrapers, or automated tools to access the store.
                </li>
                <li>
                  Uploading malicious code or interfering with the website's
                  functionality.
                </li>
                <li>Impersonating any person or entity.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-gavel text-blue-600 w-6"></i>
                8. Limitation of liability
              </h3>
              <p className="text-gray-700">
                To the maximum extent permitted by law, Finezto shall not be
                liable for any indirect, incidental, or consequential damages
                arising from your use of our store, including but not limited to
                lost profits or data. Our total liability shall not exceed the
                amount paid by you for the product in question.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-balance-scale text-blue-600 w-6"></i>
                9. Governing law & disputes
              </h3>
              <p className="text-gray-700">
                These Terms are governed by the laws of India. Any dispute
                arising out of or in connection with these Terms shall be
                subject to the exclusive jurisdiction of the courts in
                Bangalore, Karnataka. We encourage you to contact us first to
                resolve issues amicably.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-pen text-blue-600 w-6"></i>
                10. Changes to terms
              </h3>
              <p className="text-gray-700">
                We may update these Terms from time to time. The "Last updated"
                date at the top reflects the latest revision. Continued use of
                the site after changes constitutes acceptance.
              </p>
            </section>

            {/* Legal Note */}
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600 mt-8">
              <i className="fas fa-question-circle text-blue-600 mr-2"></i>
              <span className="font-semibold">
                Have a dispute or question?
              </span>{" "}
              Our customer support team is here to help:{" "}
              <a
                href="mailto:support@finezto.store"
                className="text-blue-600 hover:underline"
              >
                support@finezto.store
              </a>{" "}
              · +91 80 1234 5678 (Mon–Sat, 9am–6pm).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
