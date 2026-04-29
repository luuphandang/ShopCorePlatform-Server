import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextStore {
  requestId: string;
  userId?: number | string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContextStore>();

export const getRequestContext = (): RequestContextStore | undefined =>
  requestContextStorage.getStore();

export const setUserOnRequestContext = (userId: number | string | undefined): void => {
  const store = requestContextStorage.getStore();
  if (store && userId !== undefined && userId !== null) {
    store.userId = userId;
  }
};
