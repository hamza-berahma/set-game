import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),

    {
        files: ["**/*.{ts,mts,cts}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.node,
        },
        extends: [tseslint.configs.recommended],
    },
]);
