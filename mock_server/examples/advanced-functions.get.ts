/**
 * Advanced examples of @mock function signatures
 * These demonstrate complex data generation patterns
 */
interface AdvancedMockExamples {
  /** @mock () => `user_${crypto.randomUUID()}` */
  userId: string;

  /** @mock () => Date.now() + Math.floor(Math.random() * 100000) */
  timestamp: number;

  /** @mock () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) */
  sessionToken: string;

  /** @mock () => ['active', 'inactive', 'pending', 'suspended'][Math.floor(Math.random() * 4)] */
  status: 'active' | 'inactive' | 'pending' | 'suspended';

  /** @mock () => ({ lat: parseFloat((Math.random() * 180 - 90).toFixed(6)), lng: parseFloat((Math.random() * 360 - 180).toFixed(6)) }) */
  coordinates: { lat: number; lng: number };

  /** @mock () => Array.from({length: Math.floor(Math.random() * 10) + 1}, () => Math.floor(Math.random() * 1000)) */
  randomNumbers: number[];

  /** @mock () => new Array(Math.floor(Math.random() * 5) + 1).fill(null).map((_, i) => ({ id: i, name: `Item ${i}` })) */
  items: Array<{ id: number; name: string }>;

  /** @mock () => Math.random() < 0.3 ? null : { type: 'premium', level: Math.floor(Math.random() * 5) + 1 } */
  subscription: { type: string; level: number } | null;

  /** @mock () => ({ created: new Date().toISOString(), modified: new Date(Date.now() + 1000).toISOString() }) */
  timestamps: { created: string; modified: string };

  /** @mock () => btoa(Math.random().toString()).substring(0, 16) */
  encodedData: string;

  /** @mock () => [...new Set(Array.from({length: 10}, () => Math.floor(Math.random() * 100)))] */
  uniqueNumbers: number[];

  /** @mock () => Object.fromEntries(Array.from({length: 3}, (_, i) => [`key${i}`, `value${Math.random()}`])) */
  dynamicObject: Record<string, string>;

  /** @mock () => new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] */
  randomDate: string;

  /** @mock () => Math.random() > 0.7 ? { error: 'Something went wrong', code: Math.floor(Math.random() * 1000) } : { success: true, data: 'All good' } */
  conditionalResponse: { error: string; code: number } | { success: boolean; data: string };

  /** @mock () => JSON.stringify({ nested: { deeply: { value: Math.random() * 100 } } }) */
  jsonString: string;

  /** @mock () => `${['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)]} /api/v${Math.floor(Math.random() * 3) + 1}/resource` */
  endpoint: string;

  /** @mock () => Array.from({length: Math.floor(Math.random() * 20) + 5}, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('') */
  randomString: string;

  /** @mock () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).getTime() */
  pastTimestamp: number;

  /** @mock () => ({ r: Math.floor(Math.random() * 256), g: Math.floor(Math.random() * 256), b: Math.floor(Math.random() * 256) }) */
  rgbColor: { r: number; g: number; b: number };

  /** @mock () => Math.random().toFixed(8).substring(2) */
  precisionId: string;
}

export default AdvancedMockExamples;
