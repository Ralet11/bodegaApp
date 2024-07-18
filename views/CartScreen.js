import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Modal, FlatList, ActivityIndicator, useColorScheme, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity, clearCart } from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setAddress } from '../redux/slices/user.slice';
import { setCurrentOrder, setOrderIn } from '../redux/slices/orders.slice';
import { setUser } from '../redux/slices/user.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';
import { stylesDark, stylesLight } from '../components/themeCart';

const CartScreen = () => {
  const cart = useSelector(state => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data.client);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address) || '';
  const colorScheme = useColorScheme();
  const route = useRoute();

  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [newOrderType, setNewOrderType] = useState(orderType);
  const userAddresses = useSelector((state) => state?.user?.addresses) || [];
  const shops = useSelector((state) => state?.setUp?.shops);
  const [useBalance, setUseBalance] = useState(false);
  const [balance, setBalance] = useState(user?.balance);
  const [prevBalance, setPrevBalance] = useState(user?.balance);
  const [finalPrice, setFinalPrice] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { orderType } = route.params;

  const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price.replace('$', '')) + (item.selectedExtras ? Object.values(item.selectedExtras).reduce((extraTotal, extra) => extraTotal + extra.price, 0) : 0)) * item.quantity, 0).toFixed(2);
  };

  const calculateTax = (subtotal) => {
    const taxRate = 0.08;
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
    const total = subtotal + tax + tipAmount + (orderType === 'Delivery' ? deliveryFee : 0);

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
    if (orderType === 'Delivery') {
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
              const distance = response.data.rows[0].elements[0].distance.value / 1609.34;
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
    } else {
      setIsLoading(false);
    }
  }, [address, currentShop, user.subscription, shops]);

  const payment = async () => {
    if (isLoading || isCheckoutLoading) {
      Alert.alert("Please wait", "Calculating delivery fee...");
      return;
    }

    setIsCheckoutLoading(true);

    const total_price = calculateTotal();
    const finalPrice = Math.floor(total_price * 100);

    try {
      if (finalPrice > 0) {
        const response = await Axios.post(`${API_URL}/api/payment/intent`, {
          finalPrice: finalPrice
        });
        const { clientSecret } = response.data;

        if (response.error) {
          Alert.alert('Something went wrong');
          setIsCheckoutLoading(false);
          return;
        }

        const paymentIntentId = clientSecret.split('_secret')[0];

        const initResponse = await initPaymentSheet({
          merchantDisplayName: "Example Name",
          paymentIntentClientSecret: clientSecret,
        });

        if (initResponse.error) {
          console.log(initResponse.error);
          Alert.alert("Something went wrong");
          setIsCheckoutLoading(false);
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
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleOrder = async (pi) => {
    const total_price = calculateTotal();
    const data = {
      delivery_fee: deliveryFee,
      total_price: total_price,
      oder_details: cart,
      local_id: currentShop,
      status: "new order",
      date_time: new Date().toISOString().slice(0, -5),
      pi: pi,
      type: orderType,
      savings: calculateSavings()
    };

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await Axios.post(`${API_URL}/api/orders/add`, data, { headers });

      dispatch(setOrderIn(response.data.newOrder));
      const info = {
        data: {
          client: response.data.userUpdate,
          token,
        },
      };

      dispatch(setUser(info));
      dispatch(clearCart());

      if (useBalance) {
        const newBalance = user.balance >= finalPrice ? user.balance - finalPrice : 0;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const data = { newBalance };

        await Axios.put(`${API_URL}/api/users/removeUserBalance`, data, { headers });

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

      dispatch(clearCart());
      dispatch(setCurrentOrder(response.data.newOrder));
      navigation.navigate('AcceptedOrder');

      // Mark discounts as used
      for (const item of cart) {
       
         if (item.discount) {
          try {
            const id = { id: item.discountId };
            const response = await Axios.post(`${API_URL}/api/discounts/useDiscount`, id, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            console.log(response.data, "Discount used");
          } catch (error) {
            console.log("error al usar descuento")
            console.log(error);
          }
        }
      }
    } catch (error) {
      console.log(error.message);
      console.error(error);
    }
  };

  const makeCall = async (to, orderId) => {
    try {
      await Axios.post(`${API_URL}/api/twilio/make-call`, { to, orderId });
    } catch (error) {
      console.error('Error making call:', error);
    }
  };

  const handleBalanceChange = async (value) => {
    setPrevBalance(user.balance);
    const total_price = calculateTotal();
    setFinalPrice(total_price);
    setUseBalance(value);
    const newBalance = user.balance >= total_price ? user.balance - total_price : 0;
    if (value === true) {
      setBalance(newBalance);
    } else {
      setBalance(prevBalance);
    }
  };

  const selectAddress = (address) => {
    dispatch(setAddress(address.formatted_address));
    setModalVisible(false);
  };

  const toggleOrderType = (type) => {
    setNewOrderType(type);
    setConfirmationModalVisible(true);
  };

  const confirmOrderTypeChange = () => {
    navigation.setParams({ orderType: newOrderType });
    setConfirmationModalVisible(false);
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
          
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity onPress={() => toggleOrderType(orderType === 'Delivery' ? 'Pick-up' : 'Delivery')} disabled={orderType === 'Order-in'}>
              <View style={styles.orderType}>
                <Icon name={orderType === 'Delivery' ? 'bicycle' : orderType === 'Pick-up' ? 'walk' : 'home'} size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                <Text style={styles.orderTypeText}>{orderType}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {orderType === 'Delivery' && (
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
          )}

          <View style={styles.cartItemsContainer}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                {item.discount && (
                  <View style={styles.discountLabel}>
                    <Text style={styles.discountLabelText}>Discount</Text>
                  </View>
                )}
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  {item.selectedExtras && Object.keys(item.selectedExtras).length > 0 && (
                    <View style={styles.cartItemExtras}>
                      {Object.keys(item.selectedExtras).map((extraName) => (
                        <Text key={extraName} style={styles.cartItemExtraText}>
                          {extraName}: {item.selectedExtras[extraName].name} (${item.selectedExtras[extraName].price})
                        </Text>
                      ))}
                    </View>
                  )}
                  <View style={styles.row}>
                    <Text style={styles.cartItemPrice}>${(parseFloat(item.price.replace('$', '')) + (item.selectedExtras ? Object.values(item.selectedExtras).reduce((extraTotal, extra) => extraTotal + extra.price, 0) : 0)).toFixed(2)}</Text>
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
            {orderType === 'Delivery' && (
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
            )}
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
              <Text style={styles.savingsText}>You're saving ${calculateSavings()} with Bodega Pro</Text>
            </View>
          ) : (
            <View style={styles.adContainer}>
              <Text style={styles.adTitle}>Subscribe now to Bodega Pro and save more!</Text>
              <Text style={styles.adText}>Get free delivery and exclusive promotions</Text>
            </View>
          )}
          <TouchableOpacity style={styles.checkoutButton} onPress={payment} disabled={isCheckoutLoading}>
            {isCheckoutLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            )}
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
          <Modal
            visible={confirmationModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setConfirmationModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Order Type Change</Text>
                <Text style={styles.modalText}>Are you sure you want to change the order type to {newOrderType}?</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={confirmOrderTypeChange}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setConfirmationModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;