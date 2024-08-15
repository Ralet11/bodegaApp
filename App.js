import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import store from './redux/store';
import Navigation from './Navigation';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey="pk_test_51OJV6vCtqRjqS5ch2BT38s88U8qgkJeqWLZ8ODgOfB95sfshzLQw8gvkcmu4yplXKbuL8nnO85We2r1Ie7nYQkue00FX8swMRF">
        <Navigation />
        <Toast />
      </StripeProvider>
    </Provider>
  );
}