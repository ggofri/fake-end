export * from './types';
export * from './response-generator/core';
export * from './managers';

import { GenerateOptions } from './types';
import { MockGenerator } from './response-generator/core';
import { DependencyContainer } from './managers';

export async function generateMockFromCurl(options: GenerateOptions): Promise<void> {
  const dependencies = DependencyContainer.create(options);
  const generator = new MockGenerator(dependencies);
  await generator.generateMock(options);
}
