import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        foreground: "var(--color-foreground)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
        info: "var(--color-info)"
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "9999px"
      },
      boxShadow: {
        soft: "0 10px 40px rgba(0,0,0,0.08)",
        focus: "0 0 0 3px rgba(0, 0, 101, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
