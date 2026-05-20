import fs from "node:fs";
import path from "node:path";

export type FileReadResult<T = string> = {
  path: string;
  absolutePath: string;
  exists: boolean;
  content?: string;
  data?: T;
  parseStatus?: "ok" | "parse_error" | "not_parsed";
  notes: string[];
};

export const repoRoot = path.resolve(process.cwd(), "../..");

function resolveRepoPath(filePath: string) {
  return path.join(repoRoot, filePath);
}

export function fileExists(filePath: string) {
  return fs.existsSync(resolveRepoPath(filePath));
}

export function safeReadTextFile(filePath: string): FileReadResult {
  const absolutePath = resolveRepoPath(filePath);
  try {
    const content = fs.readFileSync(absolutePath, "utf8");
    return {
      path: filePath,
      absolutePath,
      exists: true,
      content,
      parseStatus: "not_parsed",
      notes: [],
    };
  } catch (error) {
    return {
      path: filePath,
      absolutePath,
      exists: false,
      parseStatus: "not_parsed",
      notes: [`Missing or unreadable file: ${(error as Error).message}`],
    };
  }
}

export function safeReadJsonFile<T = unknown>(filePath: string): FileReadResult<T> {
  const text = safeReadTextFile(filePath);
  if (!text.exists || typeof text.content !== "string") {
    return {
      path: text.path,
      absolutePath: text.absolutePath,
      exists: text.exists,
      content: text.content,
      parseStatus: "parse_error",
      notes: [...text.notes, "JSON file could not be read."],
    };
  }

  try {
    return {
      ...text,
      data: JSON.parse(text.content) as T,
      parseStatus: "ok",
    };
  } catch (error) {
    return {
      path: text.path,
      absolutePath: text.absolutePath,
      exists: text.exists,
      content: text.content,
      parseStatus: "parse_error",
      notes: [...text.notes, `JSON parse error: ${(error as Error).message}`],
    };
  }
}

export function safeReadYamlLikeFile(filePath: string): FileReadResult {
  return safeReadTextFile(filePath);
}

export function hasChineseText(content?: string) {
  return /[\u3400-\u9fff]/.test(content || "");
}

export function preview(content?: string, maxLength = 6000) {
  if (!content) return "";
  if (content.length <= maxLength) return content;
  return `${content.slice(0, maxLength)}\n\n[Preview truncated]`;
}
