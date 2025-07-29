import type { NextConfig } from "next"

const basePath = process.env.BASE_PATH ?? undefined
const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            "*.py": {
                loaders: ["raw-loader"],
                as: "*.js",
            },
        },
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.py$/,
            type: "asset/source", // Treat as raw source (string)
        })
        return config
    },
    basePath: basePath,
    output: "export",
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

export default nextConfig
