import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity } from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const cart = useSelector(state => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop)
  const user = useSelector((state) => state.user.userInfo.data)
  const dispatch = useDispatch();
  const navigation = useNavigation()
  const [address, setAddress] = useState('Calle 123, numero 4178');
  const [tip, setTip] = useState(0);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = user?.token
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = 2.00; // Valor fijo de impuestos para simplicidad
    return (subtotal + tax + tip).toFixed(2);
  };

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const payment = async () => {
    console.log("Payment process started");
    const total_price = calculateTotal();
    const finalPrice = Math.floor(total_price * 100);

    try {
      const response = await Axios.post(`${API_URL}/api/payment/intent`, {
        finalPrice: finalPrice
      });
      const { clientSecret } = response.data;
      console.log(clientSecret);

      if (response.error) {
        Alert.alert('Something went wrong');
        return;
      }

      const initResponse = await initPaymentSheet({
        merchantDisplayName: "Example Name",
        paymentIntentClientSecret: clientSecret,
      });

      if (initResponse.error) {
        console.log(initResponse.error);
        Alert.alert("Something went wrong");
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        console.log(error);
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        handleOrder();
      }
    } catch (error) {
      console.error("Error during payment request:", error);
      Alert.alert('Error', 'There was an error processing your payment. Please try again.');
    }
  };

  console.log(cart)
  console.log(currentShop)
  console.log(user)

  const handleOrder = async () => {



    const data = {
        delivery_fee: 0,
        total_price: 0 + calculateTotal(),
        oder_details: cart,
        local_id: currentShop,
        status: "new order",
        date_time: new Date().toISOString().slice(0, -5),
    };

    try {
        
      const headers = {
        'Authorization': `Bearer ${token}`, // Aquí debes reemplazar 'tuToken' con el token real que deseas enviar
        'Content-Type': 'application/json' // Esto indica que estás enviando datos en formato JSON
    };
       
     const response = await Axios.post(`${API_URL}/api/orders/add`, data,{ headers } );
    
        console.log(response.data, "orden");
    
        navigation.navigate('AcceptedOrder');
    } catch (error) {
        console.log(error.message);
        console.error(error);
    }
};


  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.addressContainer, isDarkMode && styles.addressContainerDark]}>
          <Text style={[styles.addressLabel, isDarkMode && styles.textDark]}>Dirección de Entrega:</Text>
          <TextInput
            style={[styles.addressInput, isDarkMode && styles.addressInputDark]}
            placeholder="Ingrese su dirección"
            placeholderTextColor="#A9A9A9"
            value={address}
            onChangeText={setAddress}
          />
        </View>
        <View style={styles.cartItemsContainer}>
          {cart.map((item) => (
            <View key={item.id} style={[styles.cartItem, isDarkMode && styles.cartItemDark]}>
              <Image source={{ uri: item.image }} style={styles.cartItemImage} />
              <View style={styles.cartItemDetails}>
                <Text style={[styles.cartItemName, isDarkMode && styles.textDark]}>{item.name}</Text>
                <View style={styles.row}>
                  <Text style={[styles.cartItemPrice, isDarkMode && styles.textDark]}>{item.price}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(decrementQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, isDarkMode && styles.textDark]}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(incrementQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={[styles.tipContainer, isDarkMode && styles.tipContainerDark]}>
          <Text style={[styles.tipLabel, isDarkMode && styles.textDark]}>Tip:</Text>
          <View style={styles.tipOptions}>
            {[0, 5, 10, 15].map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipButton, tip === amount && styles.tipButtonSelected]}
                onPress={() => setTip(amount)}
              >
                <Text style={styles.tipButtonText}>${amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.summaryContainer, isDarkMode && styles.summaryContainerDark]}>
          <Text style={[styles.summaryText, isDarkMode && styles.textDark]}>Subtotal: ${calculateSubtotal()}</Text>
          <Text style={[styles.summaryText, isDarkMode && styles.textDark]}>Tax: $2.00</Text>
          <Text style={[styles.summaryText, isDarkMode && styles.textDark]}>Tip: ${tip.toFixed(2)}</Text>
          <Text style={[styles.summaryText, isDarkMode && styles.textDark]}>Delivery: Free</Text>
          <Text style={[styles.totalText, isDarkMode && styles.textDark]}>Total: ${calculateTotal()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={payment}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  safeAreaDark: {
    backgroundColor: '#333',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  addressContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 70,
  },
  addressContainerDark: {
    backgroundColor: '#444',
  },
  addressLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  addressInput: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    color: '#333',
  },
  addressInputDark: {
    backgroundColor: '#555',
    borderColor: '#888',
    color: '#f8f8f8',
  },
  cartItemsContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
    padding: 10,
  },
  cartItemDark: {
    backgroundColor: '#444',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  textDark: {
    color: '#f8f8f8',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#000',
  },
  quantityText: {
    fontSize: 14,
    marginHorizontal: 10,
  },
  tipContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  tipContainerDark: {
    backgroundColor: '#444',
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tipButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  tipButtonSelected: {
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  summaryContainerDark: {
    backgroundColor: '#444',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartScreen;