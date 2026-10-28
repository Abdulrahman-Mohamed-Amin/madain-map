export function toSlug(name: string | undefined | null): string {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}
