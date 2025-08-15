export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  queryParams?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async request(path: string, options: RequestOptions = {}): Promise<HttpResponse> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 5000,
      queryParams
    } = options;

    const startTime = Date.now();
    
    let url = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    
    // Add query parameters
    if (queryParams && Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      url += `?${searchParams.toString()}`;
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    };

    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      const responseTime = Date.now() - startTime;
      
      let responseBody: any;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      // Convert Headers to plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      console.error('HTTP Request failed:', {
        url,
        method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async get(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<HttpResponse> {
    return this.request(path, { ...options, method: 'GET' });
  }

  async post(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse> {
    return this.request(path, { ...options, method: 'POST', body });
  }

  async put(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse> {
    return this.request(path, { ...options, method: 'PUT', body });
  }

  async delete(path: string, options: Omit<RequestOptions, 'method'> = {}): Promise<HttpResponse> {
    return this.request(path, { ...options, method: 'DELETE' });
  }

  async patch(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<HttpResponse> {
    return this.request(path, { ...options, method: 'PATCH', body });
  }
}

export function createHttpClient(baseUrl: string): HttpClient {
  return new HttpClient(baseUrl);
}