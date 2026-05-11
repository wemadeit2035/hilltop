import React, { useState } from "react";

const faqs = [
  {
    question: "What is Finezto?",
    answer:
      "Finezto is your one-stop destination for trendy fashion that expresses your unique style. We offer a curated selection of clothing for men, women, and kids.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive an email with a tracking link. You can also track your order in your account dashboard.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in original packaging. Please visit our Returns & Exchanges page for more details.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach our support team via the Contact Us page or by emailing support@finezto.com.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow"
          >
            <button
              className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
              onClick={() => handleToggle(idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-answer-${idx}`}
            >
              <span className="font-medium text-gray-900">{faq.question}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${openIndex === idx ? "rotate-180" : "rotate-0"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === idx && (
              <div
                id={`faq-answer-${idx}`}
                className="px-6 pb-4 text-gray-700 animate-fadeIn"
                role="region"
                aria-labelledby={`faq-question-${idx}`}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
