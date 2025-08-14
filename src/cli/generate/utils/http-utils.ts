import { HTTP_STATUS } from '@/constants';

export function getDefaultStatusCode(method: string): number {
  switch (method) {
    case 'GET':
      return HTTP_STATUS.OK;
    case 'POST':
      return HTTP_STATUS.CREATED;
    case 'PUT':
    case 'PATCH':
      return HTTP_STATUS.OK;
    case 'DELETE':
      return HTTP_STATUS.OK;
    default:
      return HTTP_STATUS.OK;
  }
}
