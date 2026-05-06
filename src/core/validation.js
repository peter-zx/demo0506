export function sanitizeEntries(input, maxEntries) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.slice(0, maxEntries).map((entry) => ({
    id: safeText(entry.id) || crypto.randomUUID(),
    content: safeText(entry.content),
    progress: safeText(entry.progress),
    reflection: safeText(entry.reflection)
  }));
}

export function validateEntryLimit(entries, maxEntries) {
  return entries.length < maxEntries;
}

function safeText(value) {
  return String(value ?? "").slice(0, 5000);
}

