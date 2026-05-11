// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Add paths to all your components
  ],
  theme: {
    extend: {
      // Add customizations here
      spacing: {
        "4%": "4%", // For your px-[4%] class
      },
    },
  },
  plugins: [],
};
