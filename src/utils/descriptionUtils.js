// utils/descriptionUtils.js

const normalizeNewlines = (text) =>
  (text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ");

export const stripLeadingNumber = (line) =>
  (line || "").replace(/^\s*\d+\s*[.)\]]\s+/, ""); // "1. " or "1) "

export const formatTsvToAlignedColumns = (text) => {
  const normalized = normalizeNewlines(text);

  // If no tabs, return as-is
  if (!normalized.includes("\t")) return normalized;

  let lines = normalized.split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();

  const rows = lines.map((line) => line.split("\t"));
  const maxCols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const widths = new Array(maxCols).fill(0);

  for (const row of rows) {
    for (let i = 0; i < maxCols; i++) {
      const cell = (row[i] ?? "").trimEnd();
      widths[i] = Math.max(widths[i], cell.length);
    }
  }

  return rows
    .map((row) => {
      const parts = [];
      for (let i = 0; i < maxCols; i++) {
        const cell = ((row[i] ?? "") + "").trimEnd();
        parts.push(cell.padEnd(widths[i] + 2, " ")); // 2 spaces gap
      }
      return parts.join("").trimEnd();
    })
    .join("\n");
};

// ✅ Use for UI + PDF (clean lines, aligned, NO "1." inside)
export const getDescriptionLines = (description) => {
  const normalized = normalizeNewlines(description);

  const aligned = normalized.includes("\t")
    ? formatTsvToAlignedColumns(normalized)
    : normalized;

  return aligned
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .map(stripLeadingNumber);
};

// ✅ Store description clean (no numbering)
export const prepareDescriptionForStorage = (description) => {
  const lines = getDescriptionLines(description);
  return lines.join("\n");
};

// ✅ For textarea editing view (shows 1. 2. 3. again)
export const linesToNumberedText = (lines) =>
  (lines || []).map((line, i) => `${i + 1}. ${line}`).join("\n");
