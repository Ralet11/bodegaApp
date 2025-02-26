import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store, persistor } from './redux/store';
import Navigation from './Navigation';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import useSocket from './config/useSocket';


function RootWrapper() {
  
  useSocket();
  return <Navigation />;
}

export default function App() {
  const [loaded] = useFonts({
    'font-primary': require('./assets/Kanit-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <StripeProvider publishableKey="pk_test_51OJV6vCtqRjqS5ch2BT38s88U8qgkJeqWLZ8ODgOfB95sfshzLQw8gvkcmu4yplXKbuL8nnO85We2r1Ie7nYQkue00FX8swMRF">
          {/* El RootWrapper se encarga de iniciar el socket globalmente */}
          <RootWrapper />
          <Toast />
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}
