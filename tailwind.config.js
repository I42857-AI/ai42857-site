/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      maxWidth: {
        site: "1700px",
      },
      colors: {
        // Fuel Studio 纯黑背景色系
        dark: {
          950: "#000000",
          900: "#050505",
          800: "#0a0a0a",
          700: "#111111",
          600: "#1a1a1a",
          500: "#222222",
        },
        // Fuel Studio 主色调
        fuel: {
          black: "#000",
          "near-black": "#111",
          white: "#fff",
          mint: "#d1e1e8",
          "white-85": "#ffffffd9",
          "white-50": "#ffffff80",
          "white-16": "#ffffff29",
          "white-10": "#ffffff1a",
          "black-50": "#00000080",
          "black-16": "#00000029",
          "black-10": "#0000001a",
          "light-gray": "#f7f7f7",
        },
        // 次要强调色（保留）
        copper: {
          500: "#c45d2c",
          400: "#d4713f",
          300: "#e08555",
        },
      },
      fontFamily: {
        display: ["BDO Grotesk Variable", "Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Inter", "monospace"],
      },
      
    },
  },
  plugins: [],
};
