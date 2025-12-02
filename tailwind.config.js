/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enables dark mode via class
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Core Brand Colors (Blue-Violet Futuristic)
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // 🌙 Sidebar / Dashboard Surface
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          active: "hsl(var(--sidebar-active))",
        },

        // 🧩 Neutral / Surface
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",

        // ✅ Status Colors
        success: "hsl(var(--success))",
        error: "hsl(var(--error))",
        warning: "hsl(var(--warning))",
      },

      backgroundImage: {
        // 🔷 Gradient Accent
        "gradient-primary": "linear-gradient(90deg, #3B82F6, #8B5CF6)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

