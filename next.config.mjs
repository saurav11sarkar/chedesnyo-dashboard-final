/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "api.dicebear.com",
      "res.cloudinary.com",
      "avatar.iran.liara.run" // Add any other external domains you use
    ],
  },
};

export default nextConfig;
