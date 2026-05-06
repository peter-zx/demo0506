export function formatReport(entries) {
  return entries
    .filter((entry) => hasMeaningfulContent(entry))
    .map((entry, index) => {
      const lines = [
        `${index + 1}. 做了什么内容：${normalizeLine(entry.content)}`,
        `   什么进展：${normalizeLine(entry.progress)}`,
        `   复盘反思：${normalizeLine(entry.reflection)}`
      ];

      return lines.join("\n");
    })
    .join("\n\n");
}

export function createEmptyEntry() {
  return {
    id: crypto.randomUUID(),
    content: "",
    progress: "",
    reflection: ""
  };
}

function hasMeaningfulContent(entry) {
  return Boolean(
    normalizeLine(entry.content) ||
      normalizeLine(entry.progress) ||
      normalizeLine(entry.reflection)
  );
}

function normalizeLine(value) {
  return String(value ?? "").trim();
}

