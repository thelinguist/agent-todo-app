import js from "@eslint/js"
import tseslint from "typescript-eslint"
import sonarjs from "eslint-plugin-sonarjs"
import prettier from "eslint-config-prettier"

export const baseConfig = (tsconfigRootDir) => [
  { ignores: ["dist", "coverage", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir },
    },
  },
  { files: ["**/*.js"], ...tseslint.configs.disableTypeChecked },
  prettier,
]

export default [
  ...baseConfig(import.meta.dirname),
  { ignores: ["backend", "shared"] },
]
