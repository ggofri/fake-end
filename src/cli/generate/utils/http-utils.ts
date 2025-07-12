export function getDefaultStatusCode(method: string): number {
  switch (method) {
    case 'GET':
      return 200;
    case 'POST':
      return 201;
    case 'PUT':
    case 'PATCH':
      return 200;
    case 'DELETE':
      return 200;
    default:
      return 200;
  }
}