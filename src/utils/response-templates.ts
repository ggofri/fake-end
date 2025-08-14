export function createResourceResponse(id: string): Record<string, unknown> {
  return {
    id,
    name: `Resource ${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createSuccessResponse(message: string): Record<string, unknown> {
  return {
    message,
    timestamp: new Date().toISOString()
  };
}

export function createCreatedResponse(id: string, data: Record<string, unknown>): Record<string, unknown> {
  return {
    id,
    ...data,
    message: 'Resource created successfully',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createUpdatedResponse(id: string, data: Record<string, unknown>): Record<string, unknown> {
  return {
    id,
    ...data,
    message: 'Resource updated successfully',
    updatedAt: new Date().toISOString()
  };
}
