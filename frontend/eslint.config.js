import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import globals from "globals"
import prettier from "eslint-config-prettier"
import { baseConfig } from "../eslint.config.js"

export default [
  ...baseConfig(import.meta.dirname).filter((c) => c !== prettier),
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  { languageOptions: { globals: globals.browser } },
  prettier,
]
