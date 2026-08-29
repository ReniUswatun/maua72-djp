/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [
      { source: "/admin/masuk", destination: "/masuk?peran=officer", permanent: false },
      { source: "/super-admin/masuk", destination: "/masuk?peran=super_admin", permanent: false },
    ];
  },
};

module.exports = nextConfig;
