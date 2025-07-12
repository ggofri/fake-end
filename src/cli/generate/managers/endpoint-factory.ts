import { CurlInfo, MockEndpoint, EndpointFactory } from '../types';
import { getDefaultStatusCode } from '../utils/http-utils';
import { getRelativeEndpointPath } from '../utils/file-utils';

export class MockEndpointFactory implements EndpointFactory {
  create(
    curlInfo: CurlInfo,
    mockResponse: Record<string, unknown> | Array<unknown> | string | number | boolean,
    outputDir: string
  ): MockEndpoint {
    return {
      method: curlInfo.method,
      path: getRelativeEndpointPath(curlInfo, outputDir),
      status: getDefaultStatusCode(curlInfo.method),
      body: mockResponse,
      delayMs: Math.floor(Math.random() * 200) + 50
    };
  }
}