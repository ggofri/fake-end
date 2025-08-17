interface DynamicTestResponse {
  /** @mock () => Date.now() */
  timestamp: number;

  /** @mock () => Math.random() */
  randomValue: number;

  /** @mock () => `user_${crypto.randomUUID()}` */
  userId: string;

  /** @mock () => Math.random() > 0.5 */
  isOnSale: boolean;

  /** @mock () => ['red', 'blue', 'green'][Math.floor(Math.random() * 3)] */
  color: string;

  staticValue: string;
}

export default DynamicTestResponse;
