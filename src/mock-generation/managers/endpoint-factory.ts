import { CurlInfo, MockEndpoint, EndpointFactory } from '@/mock-generation/types';
import { getDefaultStatusCode } from '@/mock-generation/utils/http-utils';
import { getRelativeEndpointPath } from '@/mock-generation/utils/file-utils';
import { DELAY_RANGE_MAX, DELAY_RANGE_MIN } from '@/shared/constants';

export class MockEndpointFactory implements EndpointFactory {
  create(
    curlInfo: CurlInfo,
    mockResponse: Record<string, unknown> | Array<unknown> | string | number | boolean,
  ): MockEndpoint {
    return {
      method: curlInfo.method,
      path: getRelativeEndpointPath(curlInfo),
      status: getDefaultStatusCode(curlInfo.method),
      body: mockResponse,
      delayMs: Math.floor(Math.random() * DELAY_RANGE_MAX) + DELAY_RANGE_MIN
    };
  }
}
