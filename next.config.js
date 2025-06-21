/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
require('dotenv').config()

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        domains: ['localhost', 'maps.googleapis.com', 'maps.gstatic.com'],
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'maps.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'maps.gstatic.com',
                pathname: '/**',
            }
        ],
    },
    trailingSlash: false,
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8000/api/:path*'
            }
        ]
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
        }
        return config
    }
}

module.exports = nextConfig

