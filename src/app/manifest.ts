import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sythoria",
    short_name: "Sythoria",
    description:
      "Official download and documentation site for Sythoria Desktop.",
    start_url: "/",
    display: "browser",
    background_color: "#f5f5f7",
    theme_color: "#4f5f9f",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
