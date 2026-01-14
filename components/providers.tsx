'use client';

import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { AuthListener } from './auth-listener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthListener />
      {children}
    </Provider>
  );
}