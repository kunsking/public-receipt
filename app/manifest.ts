import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Public Receipt",
    short_name: "Public Receipt",
    description:
      "Understand what government budgeted for your community and inspect the evidence behind the record.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#171717",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
