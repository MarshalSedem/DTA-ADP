import * as SecureStore from 'expo-secure-store';

/** Small persisted values (session token, theme). Native: encrypted SecureStore. */
export const storage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
