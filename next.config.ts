import type { NextConfig } from "next"

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
    basePath: process.env.BASE_PATH ?? undefined,
    output: "export",
}

export default nextConfig
