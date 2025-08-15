import { CurlInfo } from '@/cli/generate/types';
import { isRecordOfStrings } from '@/utils';
import { createResourceResponse, createSuccessResponse, createCreatedResponse, createUpdatedResponse } from '@/utils';

export function generateBasicMockResponse(curlInfo: CurlInfo): Record<string, unknown> {
  const { method, path, data } = curlInfo;
  const requestBody = parseRequestBody(data);

  switch (method) {
    case 'GET':
      return generateGetResponse(path);
    case 'POST':
      return generatePostResponse(requestBody);
    case 'PUT':
    case 'PATCH':
      return generateUpdateResponse(path, requestBody);
    case 'DELETE':
      return generateDeleteResponse();
    default:
      return generateDefaultResponse();
  }
}

function parseRequestBody(data?: string): Record<string, unknown> {
  if (!data) return {};
  
  try {
    const parsedData: unknown = JSON.parse(data)
    if (isRecordOfStrings(parsedData)) return parsedData

    throw new Error('Invalid JSON')
  } catch {
    return { data };
  }
}

function generateGetResponse(path: string): Record<string, unknown> {
  if (path.includes(':id') || /\/\d+$/.test(path)) {
    return generateSingleResourceResponse(path);
  }
  return generateResourceListResponse();
}

function generateSingleResourceResponse(path: string): Record<string, unknown> {
  const id = path.includes(':id') ? ':id' : '1';
  return createResourceResponse(id);
}

function generateResourceListResponse(): Record<string, unknown> {
  return {
    data: [
      createResourceResponse('1'),
      createResourceResponse('2')
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2
    }
  };
}

function generatePostResponse(requestBody: Record<string, unknown>): Record<string, unknown> {
  return createCreatedResponse('new-resource-id', requestBody);
}

function generateUpdateResponse(path: string, requestBody: Record<string, unknown>): Record<string, unknown> {
  const id = path.includes(':id') ? ':id' : '1';
  return createUpdatedResponse(id, requestBody);
}

function generateDeleteResponse(): Record<string, unknown> {
  return createSuccessResponse('Resource deleted successfully');
}

function generateDefaultResponse(): Record<string, unknown> {
  return createSuccessResponse('Success');
}
