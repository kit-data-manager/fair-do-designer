import { globalIgnores } from "eslint/config"
import reactHooks from "eslint-plugin-react-hooks"
import nextVitals from "eslint-config-next/core-web-vitals"

const eslintConfig = [
    ...nextVitals,
    reactHooks.configs.flat.recommended,
    {
        rules: {
            "react-hooks/refs": "warn",
            "react-hooks/set-state-in-effect": "warn",
        },
    },
    globalIgnores(["out/*", ".next/*"]),
]

export default eslintConfig
