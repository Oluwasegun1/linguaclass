import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  // "standalone" is for the Docker image. Vercel does its own packaging and
  // fails in its post-build step (missing next-server.js.nft.json) when it is set.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  outputFileTracingRoot: path.resolve(process.cwd(), "../../"),
  transpilePackages: ["@workspace/ui", "@workspace/database"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
}

export default nextConfig

