import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'envoi de photos produits (3 Mo max, voir src/lib/uploads.ts).
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
