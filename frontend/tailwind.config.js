/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Deep dark theme ---
        panel: '#0a0a0a',    // page background (pure dark)
        surface: '#111111',  // card / container background
        border: '#222222',   // divider and border lines
        accent: '#3b82f6',   // sky-blue buttons/links
        accentHover: '#2563eb', // hover blue
        spotify: '#1DB954',  // Spotify green
        text: {
          primary: '#f9fafb',   // near-white text
          secondary: '#9ca3af', // gray text
          muted: '#6b7280',     // subtler text
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
