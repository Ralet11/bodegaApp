import React from 'react';
import { Alert, TouchableOpacity, Text } from 'react-native';
import { useApplePay } from '@stripe/stripe-react-native';

export default function ApplePayFunction({ clientSecret }) {
  const { presentApplePay, confirmApplePayPayment } = useApplePay();

  const handlePayPress = async () => {
    const { error, paymentMethod } = await presentApplePay({
      cartItems: [
        {
          label: "Order Total",
          amount: "50", // Puedes reemplazar esto con la cantidad calculada
          type: "final",
        },
      ],
      country: "US", // Cambia al código de país que corresponda
      currency: "USD", // Cambia a la moneda que corresponda
    });

    if (error) {
      Alert.alert(error.code, error.message);
    } else {
      const { error: confirmApplePayError } = await confirmApplePayPayment(clientSecret);

      if (confirmApplePayError) {
        Alert.alert(confirmApplePayError.code, confirmApplePayError.message);
      } else {
        Alert.alert("Success", "The payment was confirmed successfully!");
      }
    }
  };

  return (
    <TouchableOpacity onPress={handlePayPress} style={{ marginTop: 20, backgroundColor: '#000', padding: 15, borderRadius: 8 }}>
      <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>Checkout with Apple Pay</Text>
    </TouchableOpacity>
  );
}