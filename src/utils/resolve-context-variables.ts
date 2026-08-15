const VARIABLES: Record<string, () => string> = {
  timestamp: () => new Date().toISOString(),
  date: () => new Date().toLocaleDateString('en-CA'),
  time: () => new Date().toLocaleTimeString(),
};

export function resolveContextVariables(template: string): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return VARIABLES[key]?.() ?? `{{${key}}}`;
  });
}
