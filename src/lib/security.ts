/**
 * Security utilities for SynapseFlow
 * Handles URL sanitization, safe redirects, and prompt injection mitigation.
 */

/**
 * Sanitizes URLs to prevent Stored XSS via dangerous schemes (javascript:, data:, vbscript:, file:).
 * Only allows valid absolute http:// and https:// URLs.
 */
export function sanitizeSafeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  // Reject dangerous schemes or control characters
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return null;
  }

  // Only permit http:// and https:// protocols
  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Validates and sanitizes internal redirect URLs to prevent Open Redirect vulnerabilities.
 * Ensures the target is a relative path starting with '/' and not a protocol-relative '//'.
 */
export function getSafeRedirectUrl(target: string | null | undefined, fallback: string = "/"): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();
  if (!trimmed) {
    return fallback;
  }

  // Must begin with a single slash '/'
  // Reject protocol-relative '//', backslashes '/\', or external schemes '://'
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://") &&
    !trimmed.includes("\r") &&
    !trimmed.includes("\n")
  ) {
    return trimmed;
  }

  return fallback;
}

/**
 * Sanitizes and bounds raw text before passing it to LLM prompt templates.
 * Enforces maximum character length to prevent Token Exhaustion DoS and escapes delimiters.
 */
export function sanitizePromptInput(text: string, maxLength: number = 8000): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // 1. Truncate to maximum permitted characters
  const bounded = text.trim().slice(0, maxLength);

  // 2. Escape triple-quote delimiter used in prompt templates
  return bounded.replace(/"""/g, '\\"\\"\\"');
}
