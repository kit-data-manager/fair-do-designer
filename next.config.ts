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
}

export default nextConfig
