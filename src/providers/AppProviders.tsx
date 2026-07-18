import { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { initializeDatabase } from '@/database/migrations';
import { persistor, store } from '@/store';

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    void initializeDatabase();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
