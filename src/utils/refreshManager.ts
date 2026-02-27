let refreshing = false;
let refreshPromise: Promise<string> | null = null;

export const createRefreshManager = (refreshFn: () => Promise<string>) => {
  return async (): Promise<string> => {
    if (!refreshing) {
      refreshing = true;
      refreshPromise = refreshFn().finally(() => {
        refreshing = false;
      });
    }
    return refreshPromise!;
  };
};
