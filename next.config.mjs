/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@svar-ui/react-gantt",
    "@svar-ui/gantt-store",
    "@svar-ui/gantt-data-provider",
    "@svar-ui/gantt-locales",
    "@svar-ui/lib-dom",
    "@svar-ui/lib-react",
    "@svar-ui/lib-state",
    "@svar-ui/react-core",
    "@svar-ui/react-editor",
    "@svar-ui/react-filter",
    "@svar-ui/react-grid",
    "@svar-ui/react-menu",
    "@svar-ui/react-toolbar",
  ],
}

export default nextConfig
