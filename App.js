import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store, persistor } from './redux/store';
import Navigation from './Navigation';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import useSocket from './config/useSocket';
import { StatusBar } from "react-native";

import { SPK, MERCH_ID } from '@env';

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
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <StripeProvider
            publishableKey={SPK}
            merchantIdentifier={MERCH_ID}
          >
            <RootWrapper />
            <Toast />
          </StripeProvider>
        </PersistGate>
      </Provider>
    </>
  );
}
