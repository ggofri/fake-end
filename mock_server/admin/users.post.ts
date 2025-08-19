/**
 * @guard {
 *  "condition": {
 *    "field": "user.role",
 *    "operator":"equals",
 *    "value":"admin"
 *  },
 *  "left": {
 *    "status": 403,
 *    "body": {
 *      "error": "Forbidden",
 *      "message": "Admin privileges required to create users"
 *  }},
 *  "right": {
 *    "status": 201,
 *    "body": {
 *      "id": "admin-user-123",
 *      "email": "{{body.email}}",
 *      "name":"{{body.name}}",
 *      "role":"user",
 *      "createdBy":"admin",
 *      "createdAt":"2024-01-01T12:00:00Z",
 *      "permissions": ["read","write"]
 *  }}}
 */
interface AdminCreateUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdBy: string;
  createdAt: string;
  permissions: string[];
}

export default AdminCreateUserResponse;
