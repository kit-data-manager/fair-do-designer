import type { NextConfig } from "next"

const basePath = process.env.BASE_PATH ?? undefined
const nextConfig: NextConfig = {
    basePath: basePath,
    output: "export",
    env: {
        NEXT_PUBLIC_BASE_PATH: basePath,
    },
}

export default nextConfig
