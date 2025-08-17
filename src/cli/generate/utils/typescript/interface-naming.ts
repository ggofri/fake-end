import { CurlInfo } from '@/cli/generate/types';

export function generateInterfaceName(curlInfo: CurlInfo): string {
  const { method, path } = curlInfo;
  
  const pathParts = path
    .split('/')
    .filter(part => part && !part.startsWith(':'))
    .map(part => part.charAt(0).toUpperCase() + part.slice(1));
  
  const methodSuffix = method === 'GET' ? 'Response' : 
                      method === 'POST' ? 'CreateResponse' :
                      method === 'PUT' ? 'UpdateResponse' :
                      method === 'DELETE' ? 'DeleteResponse' :
                      'Response';
  
  return pathParts.length > 0 ? 
    pathParts.join('') + methodSuffix : 
    'ApiResponse';
}
