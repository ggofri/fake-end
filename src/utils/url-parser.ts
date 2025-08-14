export function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

export function extractQueryParams(url: URL): Record<string, string> {
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });
  return queryParams;
}

export function findFirstNonEmptyMatch(matches: RegExpMatchArray): string {
  const nonEmptyMatches = matches.slice(1).filter(Boolean);
  return nonEmptyMatches[0] ?? '';
}
