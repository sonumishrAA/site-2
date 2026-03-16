import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "var(--brand-900)",
          700: "var(--brand-700)",
          500: "var(--brand-500)",
          100: "var(--brand-100)",
          50: "var(--brand-50)",
        },
        amber: {
          500: "var(--amber-500)",
          100: "var(--amber-100)",
        },
        green: {
          500: "var(--green-500)",
          100: "var(--green-100)",
        },
        red: {
          500: "var(--red-500)",
          100: "var(--red-100)",
        },
        gray: {
          950: "var(--gray-950)",
          800: "var(--gray-800)",
          600: "var(--gray-600)",
          400: "var(--gray-400)",
          200: "var(--gray-200)",
          100: "var(--gray-100)",
          50: "var(--gray-50)",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)"],
        sans: ["var(--font-dm-sans)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
