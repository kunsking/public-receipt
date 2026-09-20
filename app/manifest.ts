import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Public Receipt",
    short_name: "Public Receipt",
    description: "Ask. Verify. Act.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#171717",
    icons: [],
  };
}
