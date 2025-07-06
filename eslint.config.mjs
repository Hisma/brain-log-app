import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Convert strict errors to warnings for development-friendly linting
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "warn",
      
      // Turn off overly strict rules
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      
      // Keep critical rules as errors (these can break functionality)
      "react-hooks/rules-of-hooks": "error",
      "@typescript-eslint/no-use-before-define": "off",
      
      // Allow console statements in development
      "no-console": "off",
      
      // More lenient about prefer-const
      "prefer-const": "warn",
      
      // Allow empty catch blocks (sometimes intentional)
      "no-empty": "warn",
    }
  }
];

export default eslintConfig;
