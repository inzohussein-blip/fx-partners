import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// Next 16 removed `next lint`; ESLint 9 runs directly with the flat config.
const config = [
  ...nextCoreWebVitals,
  {
    // eslint-plugin-react-hooks 7 (bundled with eslint-config-next 16) added
    // strict React Compiler rules. They flag patterns that are correct here —
    // the "mounted" flag set in an effect, Date.now() when filtering slots —
    // so they stay visible as warnings rather than failing the build.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
  { ignores: [".open-next/**", ".next/**", ".wrangler/**", "node_modules/**"] },
];

export default config;
