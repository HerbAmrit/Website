/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — warm beige, used for most surfaces
        beige: {
          50: "#FBF8F1",
          100: "#F1E9D8",
          200: "#E8DCC0",
          300: "#DCC9A0",
        },
        // Secondary — deep bottle green, used for footer/nav/buttons/headings
        bottle: {
          900: "#14261A",
          800: "#1C3524",
          700: "#234531",
          600: "#2C5640",
        },
        // Accent — antique gold, used sparingly
        gold: {
          300: "#E0C68A",
          400: "#CBA958",
          500: "#B98D2E",
          600: "#96711F",
        },
        ink: "#241F16",
        cream: "#FFFDF8",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(20, 38, 26, 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
