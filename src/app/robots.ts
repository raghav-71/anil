import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/mobiles", "/accessories", "/about", "/contact", "/compare", "/orders", "/product/*"],
      disallow: ["/admin/", "/api/admin/", "/api/pos/"],
    },
    sitemap: "https://anilcommunications.com/sitemap.xml",
  };
}

