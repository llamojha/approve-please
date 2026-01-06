import { LanguagePreference, PRFileDiff } from "../types";

const LANGUAGE_ALIASES: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  js: "javascript",
  jsx: "javascript",
  javascript: "javascript",
  java: "java",
  py: "python",
  python: "python",
  golang: "go",
  go: "go",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  mdx: "markdown",
  markdown: "markdown",
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",
};

const CONFIG_LANGUAGES = new Set([
  "markdown",
  "yaml",
  "json",
  "toml",
  "ini",
  "conf",
  "config",
]);

const LANGUAGE_LABELS: Record<string, string> = {
  go: "Go",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  java: "Java",
  yaml: "YAML",
  json: "JSON",
  markdown: "Markdown",
  css: "CSS",
};

const canonicalizeLanguage = (language: string): string => {
  const key = language.toLowerCase();
  return LANGUAGE_ALIASES[key] ?? key;
};

const isConfigLanguage = (language: string): boolean => {
  return CONFIG_LANGUAGES.has(language);
};

export const getCodeLanguages = (files: PRFileDiff[]): string[] => {
  const languages = new Set<string>();
  files.forEach((file) => {
    const canonical = canonicalizeLanguage(file.language);
    if (!isConfigLanguage(canonical)) {
      languages.add(canonical);
    }
  });
  return Array.from(languages);
};

export const matchesLanguagePreference = (
  files: PRFileDiff[],
  preference: LanguagePreference
): boolean => {
  if (preference.length === 0) {
    return true;
  }
  const languages = getCodeLanguages(files);
  if (languages.length === 0) {
    return preference.includes("generic");
  }
  return languages.some((language) => preference.includes(language));
};

export const getAvailableLanguageOptions = (
  filesets: PRFileDiff[][]
): string[] => {
  const options = new Set<string>();
  filesets.forEach((files) => {
    getCodeLanguages(files).forEach((language) => options.add(language));
  });
  return Array.from(options).sort((a, b) =>
    formatLanguageLabel(a).localeCompare(formatLanguageLabel(b))
  );
};

export const formatLanguageLabel = (language: string): string => {
  if (LANGUAGE_LABELS[language]) {
    return LANGUAGE_LABELS[language];
  }
  const first = language.charAt(0);
  if (first === "") {
    return language;
  }
  return first.toUpperCase() + language.slice(1);
};
