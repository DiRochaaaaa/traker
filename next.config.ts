import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações para melhor desenvolvimento e hidratação
  reactStrictMode: true,
  
  // Desabilitar hydration warnings em desenvolvimento para extensões de browser
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  
  // Configurações para melhor performance
  poweredByHeader: false,
  compress: true,
  
  // Configurações experimentais para melhor estabilidade
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
