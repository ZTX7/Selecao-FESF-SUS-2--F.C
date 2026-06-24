import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/', // Onde o usuário acessa (localhost:3000)
        destination: '/auth/login', // Para onde ele vai
        permanent: true, // Indica para o navegador/SEO que essa é a rota permanente
      },
    ];
  },/* config options here */
  reactCompiler: true,
};

export default nextConfig;
