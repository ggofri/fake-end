import { generateInterfaceName } from '@/typescript-processing/dual-interface/interface-naming';
import { CurlInfo } from '@/mock-generation/types';

describe('interface-naming', () => {
  describe('generateInterfaceName', () => {
    it('should generate GET response interface name', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/users',
        url: 'https://api.example.com/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersResponse');
    });

    it('should generate POST response interface name', () => {
      const curlInfo: CurlInfo = {
        method: 'POST',
        path: '/users',
        url: 'https://api.example.com/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersCreateResponse');
    });

    it('should generate PUT response interface name', () => {
      const curlInfo: CurlInfo = {
        method: 'PUT',
        path: '/users',
        url: 'https://api.example.com/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersUpdateResponse');
    });

    it('should generate DELETE response interface name', () => {
      const curlInfo: CurlInfo = {
        method: 'DELETE',
        path: '/users',
        url: 'https://api.example.com/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersDeleteResponse');
    });

    it('should handle nested paths', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/api/v1/users',
        url: 'https://api.example.com/api/v1/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('ApiV1UsersResponse');
    });

    it('should ignore path parameters', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/users/:id',
        url: 'https://api.example.com/users/123',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersResponse');
    });

    it('should handle empty path', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/',
        url: 'https://api.example.com/',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('ApiResponse');
    });

    it('should handle unknown method', () => {
      const curlInfo: CurlInfo = {
        method: 'PATCH',
        path: '/users',
        url: 'https://api.example.com/users',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('UsersResponse');
    });

    it('should handle hyphenated path segments', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/api/v2/egg-group',
        url: 'https://pokeapi.co/api/v2/egg-group/1',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('ApiV2EggGroupResponse');
    });

    it('should handle multiple hyphenated segments', () => {
      const curlInfo: CurlInfo = {
        method: 'GET',
        path: '/api/user-profile/contact-info',
        url: 'https://api.example.com/api/user-profile/contact-info',
        headers: {},
        queryParams: {}
      };

      const result = generateInterfaceName(curlInfo);

      expect(result).toBe('ApiUserProfileContactInfoResponse');
    });
  });
});
