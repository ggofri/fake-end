import { CurlInfo } from '../types';

export function generateBasicMockResponse(curlInfo: CurlInfo): Record<string, unknown> {
  const { method, path, data } = curlInfo;

  let requestBody: Record<string, unknown> = {};
  if (data) {
    try {
      requestBody = JSON.parse(data);
    } catch {
      requestBody = { data: data };
    }
  }

  switch (method) {
    case 'GET':
      if (path.includes(':id') || /\/\d+$/.test(path)) {
        return {
          id: path.includes(':id') ? ':id' : '1',
          name: `Resource ${path.includes(':id') ? ':id' : '1'}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        return {
          data: [
            {
              id: '1',
              name: 'Resource 1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: '2', 
              name: 'Resource 2',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2
          }
        };
      }

    case 'POST':
      return {
        id: 'new-resource-id',
        ...requestBody,
        message: 'Resource created successfully',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    case 'PUT':
    case 'PATCH':
      return {
        id: path.includes(':id') ? ':id' : '1',
        ...requestBody,
        message: 'Resource updated successfully',
        updatedAt: new Date().toISOString()
      };

    case 'DELETE':
      return {
        message: 'Resource deleted successfully',
        deletedAt: new Date().toISOString()
      };

    default:
      return {
        message: 'Success',
        timestamp: new Date().toISOString()
      };
  }
}