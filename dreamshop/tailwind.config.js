/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--ds-bg) / <alpha-value>)",
        fg: "rgb(var(--ds-fg) / <alpha-value>)",
        muted: "rgb(var(--ds-muted) / <alpha-value>)",
        accent: "rgb(var(--ds-accent) / <alpha-value>)",
        border: "rgb(var(--ds-border) / <alpha-value>)",
        card: "rgb(var(--ds-card) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 1px 0 0 rgb(0 0 0 / 0.06), 0 20px 50px -20px rgb(0 0 0 / 0.35)",
      },
    },
  },
  plugins: [],
};

