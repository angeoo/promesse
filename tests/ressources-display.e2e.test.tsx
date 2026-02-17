import React from "react";
import { render, screen } from "@testing-library/react";
import RessourcesPage from "@/app/(site)/ressources/page";
import { listPublishedMediaBySlotIds } from "@/lib/media";

vi.mock("@/lib/media", () => ({
  listPublishedMediaBySlotIds: vi.fn()
}));

describe("Ressources page media rendering (E2E simulated)", () => {
  it("renders published media from backend", async () => {
    vi.mocked(listPublishedMediaBySlotIds).mockResolvedValue({
      "ressources.health_infographic": {
        id: "m1",
        slotId: "ressources.health_infographic",
        slotName: "Ressources - Infographie santé",
        slotAspect: "1/1",
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
    });

    render(await RessourcesPage());

    expect(screen.getByRole("img", { name: "Infographie cycle" })).toBeInTheDocument();
  });
});
