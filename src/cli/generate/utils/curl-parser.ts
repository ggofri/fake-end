import { CurlInfo } from '@/cli/generate/types';
import { normalizeUrl, extractQueryParams, findFirstNonEmptyMatch } from '@/utils';

export function parseCurlCommand(curlCommand: string): CurlInfo {
  const cleanedCommand = cleanCurlCommand(curlCommand);
  const method = extractMethod(cleanedCommand);
  const processedUrl = extractAndProcessUrl(cleanedCommand);
  const url = new URL(processedUrl);
  const queryParams = extractQueryParams(url);
  const headers = extractHeaders(cleanedCommand);
  const data = extractData(cleanedCommand);

  return {
    method,
    url: processedUrl,
    headers,
    data,
    path: url.pathname,
    queryParams
  };
}

function cleanCurlCommand(curlCommand: string): string {
  return curlCommand
    .replace(/\\\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMethod(cleanedCommand: string): string {
  const methodMatch = cleanedCommand.match(/--request\s+(\w+)|--X\s+(\w+)|-X\s+(\w+)/i);
  return (methodMatch?.[1] ?? methodMatch?.[2] ?? methodMatch?.[3] ?? 'GET').toUpperCase();
}

function extractAndProcessUrl(cleanedCommand: string): string {
  const fullUrl = extractUrl(cleanedCommand);
  if (!fullUrl) {
    throw new Error('Could not extract URL from cURL command');
  }
  return normalizeUrl(fullUrl);
}

function extractUrl(cleanedCommand: string): string | undefined {
  const urlFlagMatch = cleanedCommand.match(/--url\s+([^\s]+)/);
  if (urlFlagMatch) {
    return urlFlagMatch[1];
  }

  const curlMatch = cleanedCommand.match(/curl\s+(?:-[A-Z]\s+\w+\s+)?([^\s-]+(?:\/[^\s]*)?)/i);
  if (curlMatch) {
    return curlMatch[1];
  }

  const urlPatternMatch = cleanedCommand.match(/(https?:\/\/[^\s]+)/);
  return urlPatternMatch?.[1];
}

function extractHeaders(cleanedCommand: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const headerMatches = cleanedCommand.matchAll(/--header\s+'([^']+)'|--header\s+"([^"]+)"|--header\s+([^\s]+)|-H\s+'([^']+)'|-H\s+"([^"]+)"|-H\s+([^\s]+)/g);
  
  for (const match of headerMatches) {
    const headerValue = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[6];
    if (headerValue) {
      const [key, ...valueParts] = headerValue.split(':');
      if (key && valueParts.length > 0) {
        headers[key.trim().toLowerCase()] = valueParts.join(':').trim();
      }
    }
  }
  return headers;
}

function extractData(cleanedCommand: string): string {
  const dataMatch = cleanedCommand.match(/--data\s+'([^']+)'|--data\s+"([^"]+)"|--data\s+([^\s]+)|-d\s+'([^']+)'|-d\s+"([^"]+)"|-d\s+([^\s]+)/);
  if (!dataMatch) return '';
  
  return findFirstNonEmptyMatch(dataMatch);
}
