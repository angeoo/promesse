import React from "react";
import { render, screen } from "@testing-library/react";
import RessourcesPage from "@/app/(site)/ressources/page";
import { listMediaAssets } from "@/lib/media";

vi.mock("@/lib/media", () => ({
  listMediaAssets: vi.fn()
}));

describe("Ressources page media rendering (E2E simulated)", () => {
  it("renders published media from backend", async () => {
    vi.mocked(listMediaAssets).mockResolvedValue([
      {
        id: "m1",
        title: "Atelier pilote",
        description: "Séance d'information",
        kind: "image",
        filename: "atelier.jpg",
        contentType: "image/jpeg",
        size: 1024,
        published: true,
        createdAt: new Date().toISOString(),
        url: "https://cdn.example.test/atelier.jpg"
      }
    ]);

    render(await RessourcesPage());

    expect(screen.getByText("Atelier pilote")).toBeInTheDocument();
    expect(screen.getByText("Séance d'information")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Atelier pilote" })).toBeInTheDocument();
  });
});

