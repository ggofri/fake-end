export type validMethods = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type validLowercaseMethods = 'get' | 'post' | 'put' | 'delete' | 'patch';

export const isValidMethod = (tentativeMethod: string): tentativeMethod is validMethods => (
  ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(tentativeMethod)
);

export interface Left<T> {
  readonly _tag: 'Left';
  readonly value: T;
}

export interface Right<T> {
  readonly _tag: 'Right';
  readonly value: T;
}

export type Either<L, R> = Left<L> | Right<R>;

export const left = <T>(value: T): Left<T> => ({ _tag: 'Left', value });

export const right = <T>(value: T): Right<T> => ({ _tag: 'Right', value });

export const isLeft = <L, R>(either: Either<L, R>): either is Left<L> => either._tag === 'Left';

export const isRight = <L, R>(either: Either<L, R>): either is Right<R> => either._tag === 'Right';

export interface GuardCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
  value?: unknown;
}

export interface GuardResponse {
  status: number;
  body?: unknown;
}

export interface GuardInterfaceResponse {
  status: number;
  interface: string;
}

export interface GuardFunction {
  condition: GuardCondition;
  left: GuardResponse | GuardInterfaceResponse;
  right: GuardResponse | GuardInterfaceResponse;
}

export function isGuardInterfaceResponse(response: GuardResponse | GuardInterfaceResponse): response is GuardInterfaceResponse {
  return 'interface' in response;
}

export interface MockEndpoint {
  method: validMethods;
  path: string;
  status: number;
  body?: unknown;
  delayMs?: number;
  guard?: GuardFunction;
};

export interface ParsedEndpoint extends MockEndpoint {
  filePath: string;
  fullPath: string;
  _interfaceDeclaration?: unknown;
  _dynamicMocks?: boolean;
};

export interface ServerOptions {
  port: number;
  mockDir: string;
  verbose?: boolean;
  noCache?: boolean;
  dynamicMocks?: boolean;
  watch?: boolean;
};
