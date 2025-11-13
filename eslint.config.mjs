import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"
import { globalIgnores } from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    reactHooks.configs.flat.recommended,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "react-hooks/refs": "warn",
            "react-hooks/set-state-in-effect": "warn",
        },
    },
    globalIgnores(["out/*", ".next/*"]),
]

export default eslintConfig
