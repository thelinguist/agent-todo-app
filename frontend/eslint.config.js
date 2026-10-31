import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import globals from "globals"
import prettier from "eslint-config-prettier"
import { baseConfig } from "../eslint.config.js"

const [first, ...rest] = baseConfig(import.meta.dirname)
// prettier must stay last
const prettierLast = rest.slice(0, -1)

export default [
  first,
  ...prettierLast,
  reactHooks.configs["recommended-latest"],
  jsxA11y.flatConfigs.recommended,
  { languageOptions: { globals: globals.browser } },
  prettier,
]
