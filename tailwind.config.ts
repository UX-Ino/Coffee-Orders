import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sbx: {
          primary: "#006241",
          primaryDark: "#004d3a",
          accent: "#cba258",
          surface: "#f6f4f1",
          border: "#e5dfd8",
          ink: "#1e3932",
        },
      },
      borderRadius: {
        xl: "0.9rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
} satisfies Config;
