import { CurlInfo } from '@/mock-generation/types';

export function generateInterfaceName(curlInfo: CurlInfo): string {
  const { method, path } = curlInfo;
  
  const pathParts = path
    .split('/')
    .filter(part => part && !part.startsWith(':'))
    .map(part => 
      part
        .split('-')
        .map(subPart => subPart.charAt(0).toUpperCase() + subPart.slice(1))
        .join('')
    );
  
  const methodSuffix = method === 'GET' ? 'Response' : 
                      method === 'POST' ? 'CreateResponse' :
                      method === 'PUT' ? 'UpdateResponse' :
                      method === 'DELETE' ? 'DeleteResponse' :
                      'Response';
  
  return pathParts.length > 0 ? 
    pathParts.join('') + methodSuffix : 
    'ApiResponse';
}
