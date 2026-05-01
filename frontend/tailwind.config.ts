import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          bg: '#0a0b10',       // Deep navy from image_5abc9a.png
          card: '#161921',     // Card surface from image_5b1215.png
          blue: '#4d6af2',     // Primary blue button
          muted: '#9496a1',    // Muted text
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        // Since this isn't Next.js, we'll use standard font-family names
        // Make sure Geist is installed via npm or linked in index.html
        sans: ["Geist Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
