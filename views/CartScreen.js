import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Modal, FlatList, ActivityIndicator, useColorScheme, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, clearCart } from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setAddress } from '../redux/slices/user.slice';
import { setCurrentOrder, setOrderIn } from '../redux/slices/orders.slice';
import { setUser } from '../redux/slices/user.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';

const CartScreen = () => {
  const cart = useSelector(state => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data.client);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address) || '';
  const colorScheme = useColorScheme();

  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const userAddresses = useSelector((state) => state?.user?.addresses) || [];
  const shops = useSelector((state) => state?.setUp?.shops);
  const [useBalance, setUseBalance] = useState(false); // Nuevo estado para usar balance
  const [balance, setBalance] = useState(user?.balance)
  const [prevBalance, setPrevBalance] = useState(user?.balance)
  const [finalPrice, setFinalPrice] = useState(null)


  const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE'; // Reemplaza con tu clave de API de Google

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2);
  };

  const calculateTax = (subtotal) => {
    const taxRate = 0.08; // 8% tax rate as an example
    const tax = subtotal * taxRate;
    return user.subscription === 1 ? tax / 2 : tax;
  };

  const calculateTipAmount = (subtotal) => {
    const tipPercentage = parseFloat(tip) || parseFloat(customTip) || 0;
    return (subtotal * tipPercentage / 100).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = calculateTax(subtotal);
    const tipAmount = parseFloat(calculateTipAmount(subtotal));
    const total = subtotal + tax + tipAmount + deliveryFee;

    if (useBalance) {
      if (user.balance >= total) {
        return 0;
      } else {
        return (total - user.balance).toFixed(2);
      }
    }

    return total.toFixed(2);
  };

  const calculateSavings = () => {
    const originalTax = parseFloat(calculateSubtotal()) * 0.08;
    const savedTax = user.subscription === 1 ? originalTax / 2 : 0;
    return user.subscription === 1 ? (originalDeliveryFee + savedTax).toFixed(2) : 0;
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
            setOriginalDeliveryFee(fee);
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


    const total_price = calculateTotal();
    const finalPrice = Math.floor(total_price * 100);

    try {
      if (finalPrice > 0) {
        const response = await Axios.post(`${API_URL}/api/payment/intent`, {
          finalPrice: finalPrice
        });
        const { clientSecret } = response.data;
        console.log(response, "data del init")

        if (response.error) {
          Alert.alert('Something went wrong');
          return;
        }

        const paymentIntentId = clientSecret.split('_secret')[0];
        console.log(paymentIntentId, "pid id")


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
          handleOrder(paymentIntentId);
        }
      } else {
        handleOrder('bodegaBalance');
      }
    } catch (error) {
      console.error("Error during payment request:", error);
      Alert.alert('Error', 'There was an error processing your payment. Please try again.');
    }
  };



  const handleOrder = async (pi) => {
    const total_price = calculateTotal();
    const data = {
      delivery_fee: deliveryFee,
      total_price: total_price,
      oder_details: cart, // corregir el typo de 'oder_details'
      local_id: currentShop,
      status: "new order",
      date_time: new Date().toISOString().slice(0, -5),
      pi: pi
    };

    console.log(pi, "pi")

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await Axios.post(`${API_URL}/api/orders/add`, data, { headers });


      dispatch(setOrderIn(response.data.newOrder));
      dispatch(clearCart());
      console.log(response.data.newOrder, "nueva orden")
      console.log(useBalance)


      if (useBalance) {
        const newBalance = user.balance >= finalPrice ? user.balance - finalPrice : 0;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const data = { newBalance }

        const response = await Axios.put(`${API_URL}/api/users/removeUserBalance`, data, { headers })
        console.log(newBalance, "nuevo balance")
        console.log(finalPrice, "precio")

        const info = {
          data: {
            client: { ...user, balance: newBalance },
            token,
          },
        };

        dispatch(setUser(info));
      }

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

      const randomPhoneNumber = `+${currentShopDetails.phone}`;
      /* await makeCall(randomPhoneNumber, response.data.newOrder.id); */
      dispatch(clearCart())
      dispatch(setCurrentOrder(response.data.newOrder))
      navigation.navigate('AcceptedOrder');
    } catch (error) {
      console.log(error.message);
      console.error(error);
    }
  };

  const makeCall = async (to, orderId) => {
    try {
      const response = await Axios.post(`${API_URL}/api/twilio/make-call`, { to, orderId });

    } catch (error) {
      console.error('Error making call:', error);
    }
  };

  const handleBalanceChange = async (value) => {
    setPrevBalance(user.balance)
    const total_price = calculateTotal();
    setFinalPrice(total_price)
    setUseBalance(value)
    const newBalance = user.balance >= total_price ? user.balance - total_price : 0
    if(value === true) {
      setBalance(newBalance)
    } else {
      setBalance(prevBalance)
    }
   
  }

  const selectAddress = (address) => {
    dispatch(setAddress(address.formatted_address));
    setModalVisible(false);
  };

  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <CartSkeletonLoader />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Your Cart</Text>
          </View>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Delivery Address:</Text>
            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                placeholder="Enter your address"
                placeholderTextColor="#A9A9A9"
                value={address}
                editable={false}
              />
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Icon name="location-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
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
                      <Text style={[styles.quantityText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                        {item.quantity}
                      </Text>
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
              {[5, 10, 15, 20].map(percentage => (
                <TouchableOpacity
                  key={percentage}
                  style={[styles.tipButton, tip === percentage && styles.tipButtonSelected]}
                  onPress={() => { setTip(percentage); setCustomTip(''); }}
                >
                  <Text style={styles.tipButtonText}>{percentage}%</Text>
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
                placeholder="Enter custom tip percentage"
                placeholderTextColor="#A9A9A9"
                keyboardType="numeric"
                value={customTip}
                onChangeText={text => setCustomTip(text.replace(/[^0-9.]/g, ''))}
              />
            )}
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>Bodega Balance: ${(balance.toFixed(2))}</Text>
            <View style={styles.useBalanceContainer}>
              <Switch
                value={useBalance}
                onValueChange={(value) => handleBalanceChange(value)}
                trackColor={{ false: '#767577', true: '#ffcc00' }}
                thumbColor={useBalance ? '#f4f3f4' : '#f4f3f4'}
              />
              <Text style={styles.useBalanceLabel}>{useBalance ? 'Using Balance' : 'Use Balance'}</Text>
            </View>
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Subtotal: ${calculateSubtotal()}</Text>
            <Text style={styles.summaryText}>
              Delivery Fee:
              {user.subscription === 1 ? (
                <>
                  <Text style={styles.strikethrough}>${originalDeliveryFee}</Text> <Text style={styles.freeText}>Free</Text>
                </>
              ) : (
                `$${deliveryFee}`
              )}
            </Text>
            <Text style={styles.summaryText}>
              Tax:
              {user.subscription === 1 ? (
                <>
                  <Text style={styles.strikethrough}>${(calculateTax(parseFloat(calculateSubtotal())) * 2).toFixed(2)}</Text> ${(calculateTax(parseFloat(calculateSubtotal()))).toFixed(2)}
                </>
              ) : (
                `$${calculateTax(parseFloat(calculateSubtotal())).toFixed(2)}`
              )}
            </Text>
            <Text style={styles.summaryText}>
              Tip: ${calculateTipAmount(parseFloat(calculateSubtotal()))}
            </Text>
            <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
          </View>
          {user.subscription === 1 ? (
            <View style={styles.savingsContainer}>
              <Text style={styles.savingsText}>You're saving ${calculateSavings()} with promotions</Text>
            </View>
          ) : (
            <View style={styles.adContainer}>
              <Text style={styles.adTitle}>Subscribe now to Bodega Pro and save more!</Text>
              <Text style={styles.adText}>Get free delivery and exclusive promotions</Text>
            </View>
          )}
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
      )}
    </SafeAreaView>
  );
};
const commonStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goBackButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: 20,
  },
  addressLabel: {
    fontSize: 16,
    marginBottom: 5,
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
  },
  cartItemPrice: {
    fontSize: 14,
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
  },
  customTipInput: {
    marginTop: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
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
    marginBottom: 5,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#A9A9A9',
  },
  freeText: {
    color: 'green',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
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
  savingsContainer: {
    backgroundColor: '#fffbec',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffcc00',
    borderWidth: 1,
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6600',
  },
  adContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  adText: {
    fontSize: 16,
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
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  useBalanceContainer: {
    flexDirection: 'col',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  useBalanceButton: {
    marginLeft: 10,
  },
  useBalanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
    color: '#333',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#1c1c1c',
  },
  loaderContainer: {
    ...commonStyles.loaderContainer,
    backgroundColor: '#1c1c1c',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#1c1c1c',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#333',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    color: '#fff',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#444',
    color: '#fff',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#333',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    color: '#fff',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    color: '#fff',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#333',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    color: '#fff',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#444',
  },
  tipButtonSelected: {
    ...commonStyles.tipButtonSelected,
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    ...commonStyles.tipButtonText,
    color: '#fff',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#444',
    color: '#fff',
    borderColor: '#555',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#333',
  },
  summaryText: {
    ...commonStyles.summaryText,
    color: '#fff',
  },
  totalText: {
    ...commonStyles.totalText,
    color: '#fff',
  },
  savingsContainer: {
    ...commonStyles.savingsContainer,
    backgroundColor: '#444',
    borderColor: '#555',
  },
  savingsText: {
    ...commonStyles.savingsText,
    color: '#ffcc00',
  },
  adContainer: {
    ...commonStyles.adContainer,
    backgroundColor: '#333',
    borderColor: '#444',
  },
  adTitle: {
    ...commonStyles.adTitle,
    color: '#fff',
  },
  adText: {
    ...commonStyles.adText,
    color: '#fff',
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
    color: '#fff',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    ...commonStyles.loaderContainer,
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#333',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#fff',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    color: '#333',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#fff',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    color: '#333',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    color: '#333',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#fff',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    color: '#333',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#f2f2f2',
  },
  tipButtonSelected: {
    ...commonStyles.tipButtonSelected,
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    ...commonStyles.tipButtonText,
    color: '#333',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#f9f9f9',
    color: '#333',
    borderColor: '#ccc',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#fff',
  },
  summaryText: {
    ...commonStyles.summaryText,
    color: '#333',
  },
  totalText: {
    ...commonStyles.totalText,
    color: '#333',
  },
  savingsContainer: {
    ...commonStyles.savingsContainer,
    backgroundColor: '#fffbec',
    borderColor: '#ffcc00',
  },
  savingsText: {
    ...commonStyles.savingsText,
    color: '#ff6600',
  },
  adContainer: {
    ...commonStyles.adContainer,
    backgroundColor: '#fff',
    borderColor: '#007bff',
  },
  adTitle: {
    ...commonStyles.adTitle,
    color: '#333',
  },
  adText: {
    ...commonStyles.adText,
    color: '#333',
  },
});

export default CartScreen;