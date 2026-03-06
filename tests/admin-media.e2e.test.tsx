import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminMediaManager } from "@/components/admin/admin-media-manager";

const { replaceMock, refreshMock, signOutMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  refreshMock: vi.fn(),
  signOutMock: vi.fn()
}));

const routerMock = {
  replace: replaceMock,
  refresh: refreshMock
};

const slots = [
  {
    id: "actions.gallery_field_photo",
    name: "Actions - Galerie terrain",
    page: "Actions",
    description: "Carte Galerie terrain.",
    recommendedAspect: "4/3" as const,
    acceptedKinds: ["image"] as const
  },
  {
    id: "actions.gallery_workshop_video",
    name: "Actions - Atelier éducatif vidéo",
    page: "Actions",
    description: "Carte Atelier éducatif.",
    recommendedAspect: "16/9" as const,
    acceptedKinds: ["video"] as const
  }
];

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock
}));

vi.mock("next-auth/react", () => ({
  signOut: signOutMock
}));

type MockResponsePayload = {
  status: number;
  body: unknown;
};

function jsonResponse(payload: MockResponsePayload) {
  return {
    ok: payload.status >= 200 && payload.status < 300,
    status: payload.status,
    async json() {
      return payload.body;
    }
  } as Response;
}

describe("Admin media flow (E2E simulated)", () => {
  beforeEach(() => {
    let counter = 2;
    let items: Array<{
      id: string;
      slotId: string;
      slotName: string;
      slotAspect: "16/9" | "4/3" | "1/1";
      title: string;
      description?: string;
      kind: "image" | "video";
      filename: string;
      contentType: string;
      size: number;
      published: boolean;
      createdAt: string;
      url: string;
    }> = [
      {
        id: "seed-1",
        slotId: "actions.gallery_field_photo",
        slotName: "Actions - Galerie terrain",
        slotAspect: "4/3",
        title: "Media existant",
        description: "Deja en base",
        kind: "image",
        filename: "seed.jpg",
        contentType: "image/jpeg",
        size: 1024,
        published: true,
        createdAt: new Date().toISOString(),
        url: "https://cdn.example.test/media/seed-1"
      }
    ];
    signOutMock.mockResolvedValue(undefined);
    replaceMock.mockReset();

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        const method = (init?.method ?? "GET").toUpperCase();
        const url = new URL(rawUrl, "http://localhost");

        if (url.pathname === "/api/admin/media" && method === "GET") {
          return jsonResponse({
            status: 200,
            body: {
              media: items,
              slots: slots.map((slot) => ({
                ...slot,
                currentMedia: items.find((item) => item.slotId === slot.id) ?? null,
                available: !items.some((item) => item.slotId === slot.id)
              }))
            }
          });
        }

        if (url.pathname === "/api/admin/media" && method === "POST") {
          const body = (init?.body as FormData | undefined) ?? new FormData();
          const title = String(body.get("title") || "Nouveau media");
          const id = String(counter++);
          const media = {
            id,
            slotId: "actions.gallery_workshop_video",
            slotName: "Actions - Atelier éducatif vidéo",
            slotAspect: "16/9" as const,
            title,
            description: body.get("description") ? String(body.get("description")) : undefined,
            kind: "image" as const,
            filename: "created.jpg",
            contentType: "image/jpeg",
            size: 2048,
            published: true,
            createdAt: new Date().toISOString(),
            url: `https://cdn.example.test/media/${id}`
          };
          items = [media, ...items];
          return jsonResponse({ status: 201, body: { media } });
        }

        if (url.pathname === "/api/admin/media" && method === "DELETE") {
          const id = url.searchParams.get("id");
          if (!id) return jsonResponse({ status: 400, body: { error: "ID manquant." } });
          items = items.filter((item) => item.id !== id);
          return jsonResponse({ status: 200, body: { ok: true } });
        }

        return jsonResponse({ status: 404, body: { error: "Not found" } });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("logs in, uploads and deletes a media", async () => {
    const user = userEvent.setup();
    render(<AdminMediaManager adminEmail="admin@example.com" />);

    expect(await screen.findByText(/upload d’un média/i)).toBeInTheDocument();
    expect(await screen.findByText("Media existant")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/titre/i), "Upload test");
    const uploadButton = screen.getByRole("button", { name: /uploader/i });
    const form = uploadButton.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText(/média uploadé avec succès/i)).toBeInTheDocument();
    expect(await screen.findByText("Upload test")).toBeInTheDocument();

    const uploadedTitle = screen.getByText("Upload test");
    const uploadedCard = uploadedTitle.closest("section");
    expect(uploadedCard).not.toBeNull();
    await user.click(within(uploadedCard as HTMLElement).getByRole("button", { name: /supprimer/i }));
    await waitFor(() => {
      expect(screen.queryByText("Upload test")).not.toBeInTheDocument();
    });
  });
});
