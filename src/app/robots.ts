import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/mobiles", "/accessories", "/catalog", "/contact", "/orders", "/product/*"],
      disallow: ["/admin/", "/api/admin/"],
    },
    sitemap: "https://anilcommunications.com/sitemap.xml",
  };
}

