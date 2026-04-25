/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Poppins", "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "sans-serif"],
        serif: ["var(--font-serif)", "Instrument Serif", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          warm: "var(--card-2)",
        },
        // Logan-specific raw color tokens (not HSL-vars; used directly)
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
        },
        line: {
          DEFAULT: "var(--line)",
          2: "var(--line-2)",
        },
        cream: {
          DEFAULT: "var(--bg)",
          2: "var(--bg-2)",
          3: "var(--bg-3)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          2: "var(--brand-2)",
          soft: "var(--brand-soft)",
          ink: "var(--brand-ink)",
        },
        yellow: {
          DEFAULT: "var(--yellow)",
          2: "var(--yellow-2)",
          soft: "var(--yellow-soft)",
          ink: "var(--yellow-ink)",
        },
      },
      backgroundImage: {
        chrome: "var(--chrome)",
        "card-gradient": "linear-gradient(180deg, var(--card-2), var(--card-raw))",
        "brand-soft-gradient": "linear-gradient(180deg, rgba(30,94,255,0.08), rgba(30,94,255,0.02))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 8px 24px -20px rgba(0,0,0,0.6)",
        "soft-lg": "0 24px 60px -32px rgba(0,0,0,0.5)",
        glow: "0 0 0 4px rgba(30,94,255,0.10), 0 16px 36px -16px rgba(30,94,255,0.45)",
        cta: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px -10px rgba(30,94,255,0.55)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        chromeShine: {
          "0%": { backgroundPosition: "-200% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.4) rotate(0deg)" },
          "50%": { opacity: "1", transform: "scale(1) rotate(45deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        drop: {
          "0%": { transform: "translateY(-12px) scale(0.7)", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": { transform: "translateY(90px) scale(1)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        spinSlow: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "chrome-shine": "chromeShine 6s linear infinite",
        sparkle: "sparkle 3s ease-in-out infinite",
        "pulse-ring": "pulseRing 2s ease-out infinite",
        floaty: "floaty 4s ease-in-out infinite",
        ticker: "ticker 40s linear infinite",
        drop: "drop 4s ease-in infinite",
        "fade-up": "fadeUp 0.5s ease both",
        "spin-slow": "spinSlow 10s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
