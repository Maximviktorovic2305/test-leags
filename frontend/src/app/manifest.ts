import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Climb League",
    short_name: "Climb League",
    description: "Трассы, очки и движение между лигами.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5ef",
    theme_color: "#356b42",
    lang: "ru",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
