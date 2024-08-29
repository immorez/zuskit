import { create } from 'zustand';

export type QueryKey = ReadonlyArray<unknown>;

export type MutationKey = ReadonlyArray<unknown>;

type QueryHook<T> = (hookConfig?: Partial<QueryConfig<any>>) => {
  data: T;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

type MutationHook<T> = () => {
  mutate: (input: any) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
};

export interface QueryConfig<QueryResult> {
  cacheTime?: number;
  onSuccess?: (data: QueryResult) => void;
  onError?: (error: unknown) => void;
}

export interface MutationConfig<MutationResult> {
  onSuccess?: (data: MutationResult) => void;
  onError?: (error: unknown) => void;
}

export interface EndpointConfig<QueryResult> {
  queryFn: () => Promise<QueryResult>;
  config?: Partial<QueryConfig<QueryResult>>;
}

export interface MutationEndpointConfig<MutationInput, MutationResult> {
  mutationFn: (data: MutationInput) => Promise<MutationResult>;
  config?: Partial<MutationConfig<MutationResult>>;
}

export interface ZustorConfig {
  queries?: Record<string, EndpointConfig<any>>;
  mutations?: Record<string, MutationEndpointConfig<any, any>>;
}

// If queryFn return type is a promise, return what's inside promise.
// Otherwise, return the actual returned value's type.
export type AwaitedResult<T> = T extends PromiseLike<infer U> ? U : T;

export type ZustorStore = ReturnType<typeof create>;

export type GenerateHookTypes<Config extends ZustorConfig> = {
  [K in keyof Config['queries'] as `use${Capitalize<string & K>}Query`]: QueryHook<
    AwaitedResult<ReturnType<Config['queries'][K]['queryFn']>>
  >;
} & {
  [K in keyof Config['mutations'] as `use${Capitalize<string & K>}Mutation`]: MutationHook<
    AwaitedResult<ReturnType<Config['mutations'][K]['mutationFn']>>
  >;
};
