import { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { initializeDatabase } from '@/database/migrations';
import { getProfile } from '@/database/services/profileService';
import { persistor, store } from '@/store';
import { setProfile } from '@/store/slices/profileSlice';

function ProfileLoader({ children }: PropsWithChildren) {
  useEffect(() => {
    getProfile().then((profile) => {
      store.dispatch(setProfile(profile));
    });
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    void initializeDatabase();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ProfileLoader>{children}</ProfileLoader>
      </PersistGate>
    </Provider>
  );
}
