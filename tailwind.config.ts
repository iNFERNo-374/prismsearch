import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f1e6",
        foreground: "#4a3f35",
        primary: {
          DEFAULT: "#a67c52",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e2d8c3",
          foreground: "#5c4d3f",
        },
        card: {
          DEFAULT: "#fffcf5",
          foreground: "#4a3f35",
        },
        muted: {
          DEFAULT: "#ece5d8",
          foreground: "#7d6b56",
        },
        accent: {
          DEFAULT: "#d4c8aa",
          foreground: "#4a3f35",
        },
        border: "#dbd0ba",
        destructive: {
          DEFAULT: "#b54a35",
          foreground: "#ffffff",
        },
        sidebar: "#ece5d8",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["Libre Baskerville", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        aesthetic: "2px 3px 5px 0px rgba(51, 44, 37, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
