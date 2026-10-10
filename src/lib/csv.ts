const COLUMNS = ["company", "role", "status", "location", "salary", "url", "appliedAt", "notes"] as const;

const cell = (value: unknown) => {
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function toCsv(rows: Record<(typeof COLUMNS)[number], unknown>[]) {
  return [COLUMNS.join(","), ...rows.map((row) => COLUMNS.map((c) => cell(row[c])).join(","))].join("\n");
}
