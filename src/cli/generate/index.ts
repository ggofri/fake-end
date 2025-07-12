export * from './types';
export * from './core';
export * from './managers';

import { GenerateOptions } from './types';
import { MockGenerator } from './core';
import { DependencyContainer } from './managers';

export async function generateMockFromCurl(options: GenerateOptions): Promise<void> {
  const dependencies = DependencyContainer.create();
  const generator = new MockGenerator(dependencies);
  await generator.generateMock(options);
}