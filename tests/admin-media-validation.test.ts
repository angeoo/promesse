import {
  ALLOWED_CONTENT_TYPES,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  inferKind,
  validateTextField
} from "@/app/api/admin/media/route";

describe("Admin media validation", () => {
  it("rejects titles containing angle brackets", () => {
    const result = validateTextField({
      value: "<script>alert(1)</script>",
      fieldName: "titre",
      maxLength: MAX_TITLE_LENGTH
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected validation failure");
    expect(result.error).toMatch(/titre contient des caractères non autorisés/i);
  });

  it("rejects descriptions that exceed the limit", () => {
    const result = validateTextField({
      value: "a".repeat(MAX_DESCRIPTION_LENGTH + 1),
      fieldName: "description",
      maxLength: MAX_DESCRIPTION_LENGTH
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected validation failure");
    expect(result.error).toMatch(/description dépasse 500 caractères/i);
  });

  it("rejects unsupported mime types", () => {
    expect(ALLOWED_CONTENT_TYPES.has("image/svg+xml")).toBe(false);
    expect(inferKind("image/svg+xml")).toBe("image");
  });

  it("accepts a normal text value after trimming", () => {
    const result = validateTextField({
      value: "  Atelier terrain  ",
      fieldName: "titre",
      maxLength: MAX_TITLE_LENGTH
    });

    expect(result).toEqual({ ok: true, value: "Atelier terrain" });
  });
});
