import type { MediaKind } from "@/lib/media";

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_TITLE_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
export const DISALLOWED_TEXT_PATTERN = /[<>]/;
export const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

export function inferKind(contentType: string): MediaKind | null {
  if (contentType.startsWith("image/")) return "image";
  if (contentType.startsWith("video/")) return "video";
  return null;
}

export function validateTextField(params: {
  value: FormDataEntryValue | null;
  fieldName: string;
  maxLength: number;
  required?: boolean;
}): { ok: true; value: string | undefined } | { ok: false; error: string } {
  if (typeof params.value !== "string") {
    if (params.required) {
      return { ok: false, error: `Le champ ${params.fieldName} est invalide.` };
    }
    return { ok: true, value: undefined };
  }

  const trimmed = params.value.trim();
  if (!trimmed) {
    if (params.required) {
      return { ok: false, error: `Le champ ${params.fieldName} est requis.` };
    }
    return { ok: true, value: undefined };
  }

  if (trimmed.length > params.maxLength) {
    return {
      ok: false,
      error: `Le champ ${params.fieldName} dépasse ${params.maxLength} caractères.`
    };
  }

  if (DISALLOWED_TEXT_PATTERN.test(trimmed)) {
    return {
      ok: false,
      error: `Le champ ${params.fieldName} contient des caractères non autorisés.`
    };
  }

  return { ok: true, value: trimmed };
}
