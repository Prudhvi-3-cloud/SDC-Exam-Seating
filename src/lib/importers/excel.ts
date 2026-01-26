import * as XLSX from "xlsx";

export function parseExcel(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
}
