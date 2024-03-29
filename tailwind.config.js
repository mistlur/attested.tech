/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    fontFamily: {
      sans: ['"Roboto Mono"', "sans-serif"],
      ultrablack: ['"Unbounded"', "sans-serif"],
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".border-base-outline": {
          borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
          "--tw-border-opacity": "0.2",
        },
        ".divide-base-outline": {
          "&>:not([hidden])~:not([hidden])": {
            borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
            "--tw-border-opacity": "0.2",
          },
        },
      });
    }),
    plugin(({ addComponents, theme }) => {
      const headings = {
        ".h1": {
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.light"),
        },
        ".h2": {
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.light"),
        },
        ".h3": {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.light"),
        },
        ".h4": {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.light"),
        },
        "@screen md": {
          ".h1": {
            fontSize: theme("fontSize.3xl"),
            fontWeight: theme("fontWeight.light"),
          },
          ".h2": {
            fontSize: theme("fontSize.2xl"),
            fontWeight: theme("fontWeight.light"),
          },
          ".h3": {
            fontSize: theme("fontSize.xl"),
            fontWeight: theme("fontWeight.light"),
          },
          ".h4": {
            fontSize: theme("fontSize.lg"),
            fontWeight: theme("fontWeight.light"),
          },
        },
      };
      addComponents(headings, {
        variants: ["responsive"],
      });
    }),
  ],
  daisyui: {
    themes: [
      {
        attested: {
          ...require("daisyui/src/colors/themes")["[data-theme=business]"],
          primary: "#efeeec",
          secondary: "#a4cbc4",
          accent: "#fc7d1d",
          neutral: "#4b555b",
          ["base-100"]: "#000000",
          ["base-200"]: "#262b2e",
          ["base-300"]: "#000000",
          info: "#0B8098",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
};
