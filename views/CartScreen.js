import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Modal, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity } from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setAddress } from '../redux/slices/user.slice';

const CartScreen = () => {
  const cart = useSelector(state => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = user?.token;
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const userAddresses = useSelector((state) => state?.user?.addresses) || [];
  const shops = useSelector((state) => state?.setUp?.shops);

  const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2);
  };

  const calculateTax = () => {
    const taxRate = user.subscription === 1 ? 1 : 2.00;
    return taxRate;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = calculateTax();
    const tipAmount = parseFloat(tip) || parseFloat(customTip) || 0;
    return (subtotal + tax + tipAmount + deliveryFee).toFixed(2);
  };

  useEffect(() => {
    const findCurrentShop = () => {
      for (const categoryId in shops) {
        const shop = shops[categoryId].find(shop => shop.id === currentShop);
        if (shop) {
          return shop;
        }
      }
      return null;
    };

  

    const currentShopDetails = findCurrentShop();

    if (address && currentShopDetails && currentShopDetails.address) {
      const calculateDeliveryFee = async () => {
        try {
          const response = await Axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(currentShopDetails.address)}&key=${GOOGLE_API_KEY}`);
          if (response.data.status === "OK") {
            const distance = response.data.rows[0].elements[0].distance.value / 1609.34; // Convert meters to miles
            let fee = 0;
            if (distance <= 4) {
              fee = 3;
            } else if (distance > 4 && distance <= 10) {
              fee = 6;
            }
            setDeliveryFee(user.subscription === 1 ? 0 : fee);
          } else {
            console.error("Error fetching distance from Google Maps API:", response.data);
            Alert.alert("Error", "Failed to calculate delivery fee. Please try again.");
          }
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching distance from Google Maps API:", error);
          Alert.alert("Error", "Failed to calculate delivery fee. Please try again.");
          setIsLoading(false);
        }
      };

      calculateDeliveryFee();
    } else {
      setIsLoading(false);
      Alert.alert('Error', 'No se encontró la tienda seleccionada o la dirección está vacía.');
    }
  }, [address, currentShop, user.subscription, shops]);

  const payment = async () => {
    if (isLoading) {
      Alert.alert("Please wait", "Calculating delivery fee...");
      return;
    }

    console.log("Payment process started");
    const total_price = calculateTotal();
    const finalPrice = Math.floor(total_price * 100);

    try {
      const response = await Axios.post(`${API_URL}/api/payment/intent`, {
        finalPrice: finalPrice
      });
      const { clientSecret } = response.data;

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

  const handleOrder = async () => {
    const data = {
      delivery_fee: deliveryFee,
      total_price: calculateTotal(),
      oder_details: cart,
      local_id: currentShop,
      status: "new order",
      date_time: new Date().toISOString().slice(0, -5),
    };

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await Axios.post(`${API_URL}/api/orders/add`, data, { headers });

      console.log(response.data, "orden");

      navigation.navigate('AcceptedOrder');
    } catch (error) {
      console.log(error.message);
      console.error(error);
    }
  };

  const selectAddress = (address) => {
    dispatch(setAddress(address))
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Dirección de Entrega:</Text>
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              placeholder="Ingrese su dirección"
              placeholderTextColor="#A9A9A9"
              value={address}
              editable={false}
            />
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Icon name="location-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cartItemsContainer}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.cartItemImage} />
              <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <View style={styles.row}>
                  <Text style={styles.cartItemPrice}>{item.price}</Text>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(decrementQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => dispatch(incrementQuantity(item.id))}>
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.tipContainer}>
          <Text style={styles.tipLabel}>Tip:</Text>
          <View style={styles.tipOptions}>
            {[1, 2, 3, 4, 5].map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipButton, tip === amount && styles.tipButtonSelected]}
                onPress={() => { setTip(amount); setCustomTip(''); }}
              >
                <Text style={styles.tipButtonText}>${amount}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.tipButton, customTip !== '' && styles.tipButtonSelected]}
              onPress={() => { setTip(''); setCustomTip(''); }}
            >
              <Text style={styles.tipButtonText}>Custom</Text>
            </TouchableOpacity>
          </View>
          {tip === '' && (
            <TextInput
              style={styles.customTipInput}
              placeholder="Enter custom tip"
              placeholderTextColor="#A9A9A9"
              keyboardType="numeric"
              value={customTip}
              onChangeText={text => setCustomTip(text.replace(/[^0-9.]/g, ''))}
            />
          )}
        </View>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>Subtotal: ${calculateSubtotal()}</Text>
          <Text style={styles.summaryText}>Tax: ${calculateTax()}</Text>
          <Text style={styles.summaryText}>Tip: ${parseFloat(tip) || parseFloat(customTip) || 0}</Text>
          <Text style={styles.summaryText}>Delivery: {user.subscription === 1 ? 'Free' : `$${deliveryFee}`}</Text>
          <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={payment}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <FlatList
                data={userAddresses}
                keyExtractor={(item) => item.adressID?.toString() || item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.addressItem}
                    onPress={() => selectAddress(item)}
                  >
                    <Text style={styles.addressText}>{item.formatted_address}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  addressContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 70,
  },
  addressLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '600',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  cartItemsContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    padding: 15,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
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
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#333',
  },
  tipContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tipButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  tipButtonSelected: {
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  customTipInput: {
    marginTop: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#ff9900',
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
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addressText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ff9900',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
});

export default CartScreen;