import { CurlInfo } from '../types';

export function parseCurlCommand(curlCommand: string): CurlInfo {
  const cleanedCommand = curlCommand
    .replace(/\\\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const methodMatch = cleanedCommand.match(/--request\s+(\w+)|--X\s+(\w+)|-X\s+(\w+)/i);
  const method = (methodMatch?.[1] || methodMatch?.[2] || methodMatch?.[3] || 'GET').toUpperCase();

  let fullUrl: string | undefined;
  
  const urlFlagMatch = cleanedCommand.match(/--url\s+([^\s]+)/);
  if (urlFlagMatch) {
    fullUrl = urlFlagMatch[1];
  } else {
    const curlMatch = cleanedCommand.match(/curl\s+(?:-[A-Z]\s+\w+\s+)?([^\s-]+(?:\/[^\s]*)?)/i);
    if (curlMatch) {
      fullUrl = curlMatch[1];
    } else {
      const urlPatternMatch = cleanedCommand.match(/(https?:\/\/[^\s]+)/);
      if (urlPatternMatch) {
        fullUrl = urlPatternMatch[1];
      }
    }
  }
  
  if (!fullUrl) {
    throw new Error('Could not extract URL from cURL command');
  }
  
  let processedUrl = fullUrl;
  if (!processedUrl.startsWith('http')) {
    processedUrl = 'https://' + processedUrl;
  }
  
  const url = new URL(processedUrl);
  const path = url.pathname;
  const queryParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const headers: Record<string, string> = {};
  const headerMatches = cleanedCommand.matchAll(/--header\s+'([^']+)'|--header\s+"([^"]+)"|--header\s+([^\s]+)|-H\s+'([^']+)'|-H\s+"([^"]+)"|-H\s+([^\s]+)/g);
  
  for (const match of headerMatches) {
    const headerValue = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
    if (headerValue) {
      const [key, ...valueParts] = headerValue.split(':');
      if (key && valueParts.length > 0) {
        headers[key.trim().toLowerCase()] = valueParts.join(':').trim();
      }
    }
  }

  const dataMatch = cleanedCommand.match(/--data\s+'([^']+)'|--data\s+"([^"]+)"|--data\s+([^\s]+)|-d\s+'([^']+)'|-d\s+"([^"]+)"|-d\s+([^\s]+)/);
  const data = dataMatch?.[1] || dataMatch?.[2] || dataMatch?.[3] || dataMatch?.[4] || dataMatch?.[5] || dataMatch?.[6] || '';

  return {
    method,
    url: processedUrl,
    headers,
    data,
    path,
    queryParams
  };
}