import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ShippingReturns = () => {
  const [activeTab, setActiveTab] = useState("shipping");
  const location = useLocation();

  useEffect(() => {
    // Handle URL hash for direct linking
    if (window.location.hash === "#returns") {
      setActiveTab("returns");
    } else if (window.location.hash === "#shipping") {
      setActiveTab("shipping");
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
          <i className="fas fa-truck text-blue-500 text-xl"></i>
          <span>Fast shipping, easy returns — we've got you covered.</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm font-medium text-gray-700">
          <i className="far fa-calendar-alt text-blue-500"></i>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex bg-gray-100 mx-8 mt-6 rounded-full p-1 w-fit border border-gray-200">
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
            activeTab === "shipping"
              ? "bg-white text-blue-900 shadow-md"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("shipping")}
        >
          <i className="fas fa-shipping-fast"></i>
          Shipping Information
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
            activeTab === "returns"
              ? "bg-white text-blue-900 shadow-md"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("returns")}
        >
          <i className="fas fa-undo-alt"></i>
          Returns & Exchanges
        </button>
      </div>

      {/* Content Panels */}
      <div className="p-8">
        {/* Shipping Information Panel */}
        {activeTab === "shipping" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-3 flex items-center gap-3">
              <i className="fas fa-shipping-fast text-blue-600"></i>
              Shipping Information
            </h2>

            <p className="text-gray-700">
              At <span className="font-semibold">Finezto</span>, we want your
              order to reach you as quickly and safely as possible. This page
              outlines our shipping policies, delivery timeframes, and
              everything you need to know about getting your favorite styles to
              your doorstep.
            </p>

            {/* Section 1 - Shipping Methods */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-box-open text-blue-600 w-6"></i>
                1. Shipping Methods & Carriers
              </h3>
              <p className="text-gray-700 mb-3 font-medium">
                We partner with trusted carriers to ensure reliable delivery:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Standard Shipping:</span>{" "}
                  Delivered within 5-7 business days via USPS, FedEx, or UPS.
                </li>
                <li>
                  <span className="font-semibold">Express Shipping:</span>{" "}
                  Delivered within 2-3 business days via FedEx Priority or UPS
                  2nd Day Air.
                </li>
                <li>
                  <span className="font-semibold">Next-Day Shipping:</span>{" "}
                  Delivered within 1 business day (order must be placed by 12 PM
                  EST).
                </li>
                <li>
                  <span className="font-semibold">International Shipping:</span>{" "}
                  Delivered within 7-14 business days via DHL or FedEx
                  International.
                </li>
              </ul>
            </section>

            {/* Section 2 - Shipping Costs */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-dollar-sign text-blue-600 w-6"></i>
                2. Shipping Costs
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated Delivery
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Standard
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        $5.99 or FREE on orders $50+
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        5-7 business days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Express
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        $12.99
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        2-3 business days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Next-Day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        $19.99
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        1 business day
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        International
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        Calculated at checkout
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        7-14 business days
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 - Order Processing */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-clock text-blue-600 w-6"></i>
                3. Order Processing Time
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  Orders are processed within{" "}
                  <span className="font-semibold">1-2 business days</span>{" "}
                  (excluding weekends and holidays).
                </li>
                <li>
                  You'll receive a confirmation email with tracking information
                  once your order ships.
                </li>
                <li>
                  Orders placed after 2 PM EST will begin processing the next
                  business day.
                </li>
                <li>
                  During peak seasons (holidays, sales), processing may take an
                  additional 1-2 days.
                </li>
              </ul>
            </section>

            {/* Section 4 - International Shipping */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-globe-americas text-blue-600 w-6"></i>
                4. International Shipping
              </h3>
              <p className="text-gray-700 mb-3">
                We ship to over 50 countries worldwide. Please note:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Customs & Duties:</span> The
                  customer is responsible for any import duties, taxes, or
                  customs fees.
                </li>
                <li>
                  <span className="font-semibold">Delivery Times:</span>{" "}
                  International deliveries may experience delays due to customs
                  clearance.
                </li>
                <li>
                  <span className="font-semibold">Tracking:</span> International
                  orders include full tracking from shipment to delivery.
                </li>
                <li>
                  <span className="font-semibold">Restrictions:</span> Some
                  items may be restricted for international shipping due to size
                  or material regulations.
                </li>
              </ul>
            </section>

            {/* Section 5 - Shipping Restrictions */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-exclamation-triangle text-blue-600 w-6"></i>
                5. Shipping Restrictions
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  We currently do not ship to P.O. boxes or APO/FPO addresses.
                </li>
                <li>
                  Some remote areas may incur additional shipping charges or
                  extended delivery times.
                </li>
                <li>
                  Orders with multiple items may ship separately from different
                  warehouses.
                </li>
                <li>Signature may be required for orders over $200.</li>
              </ul>
            </section>

            {/* Section 6 - Missing or Damaged Items */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-clipboard-check text-blue-600 w-6"></i>
                6. Missing or Damaged Items
              </h3>
              <p className="text-gray-700">
                If your package arrives damaged or items are missing, please
                contact us within{" "}
                <span className="font-semibold">48 hours</span> of delivery at{" "}
                <a
                  href="mailto:shipping@yourstore.com"
                  className="text-blue-600 hover:underline"
                >
                  shipping@yourstore.com
                </a>{" "}
                with your order number and photos of the damage. We'll resolve
                the issue promptly.
              </p>
            </section>

            {/* Shipping Note */}
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600 mt-8">
              <i className="fas fa-truck text-blue-600 mr-2"></i>
              <span className="font-semibold">Shipping questions?</span> Contact
              our shipping team:{" "}
              <a
                href="mailto:shipping@yourstore.com"
                className="text-blue-600 hover:underline"
              >
                shipping@yourstore.com
              </a>{" "}
              · 1-800-123-4567 (Mon–Fri, 9am–6pm EST).
            </div>
          </div>
        )}

        {/* Returns & Exchanges Panel */}
        {activeTab === "returns" && (
          <div className="space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-3 flex items-center gap-3">
              <i className="fas fa-undo-alt text-blue-600"></i>
              Returns & Exchanges
            </h2>

            <p className="text-gray-700">
              We want you to love your purchase! If something isn't quite right,
              our hassle-free returns and exchanges policy makes it easy to find
              the perfect fit.
            </p>

            {/* Section 1 - Return Policy */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-calendar-alt text-blue-600 w-6"></i>
                1. Return Policy
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Return Window:</span> We
                  accept returns within{" "}
                  <span className="font-semibold">30 days</span> of the delivery
                  date.
                </li>
                <li>
                  <span className="font-semibold">Condition:</span> Items must
                  be unworn, unwashed, and in original condition with all tags
                  attached.
                </li>
                <li>
                  <span className="font-semibold">Proof of Purchase:</span>{" "}
                  Order number or receipt required.
                </li>
                <li>
                  <span className="font-semibold">Final Sale Items:</span>{" "}
                  Intimates, swimwear, and accessories (earrings, hats) are
                  final sale and non-returnable for hygiene reasons.
                </li>
              </ul>
            </section>

            {/* Section 2 - How to Return */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-arrow-circle-right text-blue-600 w-6"></i>
                2. How to Initiate a Return
              </h3>
              <ol className="list-decimal pl-8 space-y-3 text-gray-700">
                <li>
                  <span className="font-semibold">Log in</span> to your account
                  and go to "Order History."
                </li>
                <li>
                  Select the item(s) you wish to return and choose a reason for
                  return.
                </li>
                <li>
                  Print the prepaid return shipping label (for domestic
                  returns).
                </li>
                <li>
                  Pack the items securely in the original packaging, if
                  possible.
                </li>
                <li>
                  Attach the return label and drop off at any carrier location.
                </li>
              </ol>
              <p className="text-gray-700 mt-4">
                No account? Contact our support team at{" "}
                <a
                  href="mailto:returns@yourstore.com"
                  className="text-blue-600 hover:underline"
                >
                  returns@yourstore.com
                </a>{" "}
                to process your return.
              </p>
            </section>

            {/* Section 3 - Refunds */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-money-bill-wave text-blue-600 w-6"></i>
                3. Refunds
              </h3>
              <ul className="list-disc pl-8 space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">Processing Time:</span>{" "}
                  Refunds are processed within{" "}
                  <span className="font-semibold">5-7 business days</span> after
                  we receive and inspect your return.
                </li>
                <li>
                  <span className="font-semibold">Payment Method:</span> Refunds
                  are issued to the original payment method.
                </li>
                <li>
                  <span className="font-semibold">Shipping Costs:</span>{" "}
                  Original shipping charges are non-refundable unless the return
                  is due to our error.
                </li>
                <li>
                  <span className="font-semibold">Partial Refunds:</span> Items
                  with obvious wear, damage, or missing tags may receive a
                  partial refund.
                </li>
              </ul>
            </section>

            {/* Section 4 - Exchanges */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-exchange-alt text-blue-600 w-6"></i>
                4. Exchanges
              </h3>
              <p className="text-gray-700">
                Exchanges for a different size or color are free and easy!
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700 mt-3">
                <li>
                  <span className="font-semibold">How to Exchange:</span> Select
                  "Exchange" when initiating your return and choose your
                  preferred size/color.
                </li>
                <li>
                  <span className="font-semibold">Timeline:</span> We'll ship
                  your exchange item as soon as we receive your return.
                </li>
                <li>
                  <span className="font-semibold">Price Differences:</span> If
                  the exchange item costs more, we'll charge the difference. If
                  it costs less, we'll refund the difference.
                </li>
                <li>
                  <span className="font-semibold">Faster Option:</span> For
                  quicker exchanges, we recommend returning the original item
                  and placing a new order.
                </li>
              </ul>
            </section>

            {/* Section 5 - Return Shipping Costs */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-tag text-blue-600 w-6"></i>
                5. Return Shipping Costs
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Domestic Returns
                  </h4>
                  <p className="text-gray-700">
                    $5.99 will be deducted from your refund for return shipping,
                    OR choose to use your own shipping method.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    International Returns
                  </h4>
                  <p className="text-gray-700">
                    Customers are responsible for return shipping costs. We
                    recommend using a trackable shipping service.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 - Defective Items */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-exclamation-circle text-blue-600 w-6"></i>
                6. Defective or Incorrect Items
              </h3>
              <p className="text-gray-700">
                If you receive a defective item or the wrong product, please
                contact us immediately at{" "}
                <a
                  href="mailto:returns@yourstore.com"
                  className="text-blue-600 hover:underline"
                >
                  returns@yourstore.com
                </a>{" "}
                within <span className="font-semibold">7 days</span> of
                delivery. Include:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700 mt-3">
                <li>Order number</li>
                <li>Photo of the defect or incorrect item</li>
                <li>Description of the issue</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We'll provide a prepaid return label and process a full refund
                or replacement immediately upon tracking confirmation.
              </p>
            </section>

            {/* Section 7 - Gift Returns */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-gift text-blue-600 w-6"></i>
                7. Gift Returns
              </h3>
              <p className="text-gray-700">
                If you received an item as a gift and want to return it:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-gray-700 mt-3">
                <li>
                  Contact us with the order number (if available) or gift
                  recipient's name.
                </li>
                <li>
                  We'll issue a <span className="font-semibold">gift card</span>{" "}
                  for the return value, which can be used for any future
                  purchase.
                </li>
                <li>
                  Gift returns must meet the same condition requirements
                  (unworn, with tags).
                </li>
              </ul>
            </section>

            {/* Section 8 - Holiday Extended Returns */}
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-snowman text-blue-600 w-6"></i>
                8. Holiday Extended Returns
              </h3>
              <p className="text-gray-700">
                For purchases made between{" "}
                <span className="font-semibold">
                  November 1 and December 24
                </span>
                , our return window is extended to{" "}
                <span className="font-semibold">January 31</span> of the
                following year. Perfect for holiday gift-giving!
              </p>
            </section>

            {/* Returns Note */}
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600 mt-8">
              <i className="fas fa-question-circle text-blue-600 mr-2"></i>
              <span className="font-semibold">
                Need help with a return or exchange?
              </span>{" "}
              Our customer service team is here for you:{" "}
              <a
                href="mailto:returns@yourstore.com"
                className="text-blue-600 hover:underline"
              >
                returns@yourstore.com
              </a>{" "}
              · 1-800-123-4567 (Mon–Sat, 9am–6pm EST).
            </div>

            {/* FAQ Accordion Style Section */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <i className="fas fa-question-circle text-blue-600 w-6"></i>
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 font-medium text-gray-800 flex justify-between items-center">
                    Can I return items from multiple orders together?
                    <i className="fas fa-chevron-down text-gray-500"></i>
                  </button>
                  <div className="px-6 py-4 text-gray-700 bg-white">
                    Yes, but please include a note with all order numbers. We
                    recommend using separate packages for each order to ensure
                    proper tracking.
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 font-medium text-gray-800 flex justify-between items-center">
                    How long do exchanges take?
                    <i className="fas fa-chevron-down text-gray-500"></i>
                  </button>
                  <div className="px-6 py-4 text-gray-700 bg-white">
                    Exchanges typically process within 7-10 business days from
                    the day we receive your return, plus shipping time for the
                    new item.
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 font-medium text-gray-800 flex justify-between items-center">
                    What if I lost my return label?
                    <i className="fas fa-chevron-down text-gray-500"></i>
                  </button>
                  <div className="px-6 py-4 text-gray-700 bg-white">
                    Contact our support team and we'll email you a new label.
                    You can also generate a new label from your account
                    dashboard.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingReturns;
