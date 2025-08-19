export interface ErrorResponse {
  error: string;
  message: string;
  code: number;
  details?: string[];
}

export interface SuccessResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  permissions: string[];
}

/**
 * @guard {
 *  "condition": {
 *    "field": "role",
 *    "operator":"equals",
 *    "value":"admin"
 *  },
 *  "left": {
 *    "status": 403,
 *    "interface": "ErrorResponse"
 *  },
 *  "right": {
 *    "status": 201,
 *    "interface": "SuccessResponse"
 *  }}
 */
interface DualGuardTestResponse {
  message: string;
}

export default DualGuardTestResponse;
