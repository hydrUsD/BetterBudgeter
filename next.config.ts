import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: isDev,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  // Externalize packages that use Node.js APIs incompatible with bundling
  serverExternalPackages: ["jsonwebtoken"],
};

export default withPWA(nextConfig);
