import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, Modal, FlatList, ActivityIndicator, useColorScheme, Switch, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const cart = useSelector(state => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data.client);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address) || '';
  const colorScheme = useColorScheme();
  const route = useRoute();
  console.log(cart, "carrito")

  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false); // Nuevo estado para el modal de checkout
  const [newOrderType, setNewOrderType] = useState(orderType);
  const userAddresses = useSelector((state) => state?.user?.addresses) || [];
  const shops = useSelector((state) => state?.setUp?.shops);
  const [useBalance, setUseBalance] = useState(false);
  const [balance, setBalance] = useState(user?.balance);
  const [prevBalance, setPrevBalance] = useState(user?.balance);
  const [finalPrice, setFinalPrice] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { orderType } = route.params;
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [serviceFee, setServiceFee] = useState(null);

  const [deliveryInstructions, setDeliveryInstructions] = useState(''); // Nuevo estado para las instrucciones

  const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

  console.log(originalDeliveryFee, "original deliveyr fee");

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
      const calculateAdjustedDeliveryFee = (orderTotal, calculatedDeliveryFee) => {
        const restaurantShare = orderTotal * 0.80;
        const companyShare = orderTotal * 0.20;

        const percentage1 = companyShare * 0.25;

        const serviceFee = orderTotal * 0.05;

        const totalFromBoth5 = percentage1 + serviceFee;

        let adjustedDeliveryFee = calculatedDeliveryFee - totalFromBoth5;

        if (adjustedDeliveryFee < 0) {
          adjustedDeliveryFee = 0;
        }

        return {
          adjustedDeliveryFee: adjustedDeliveryFee.toFixed(2),
          serviceFee: serviceFee.toFixed(2),
          percentage1: percentage1.toFixed(2),
        };
      };

      if (address && currentShopDetails && currentShopDetails.address) {
        const calculateDeliveryFee = async () => {
          try {
            const response = await Axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(currentShopDetails.address)}&key=${GOOGLE_API_KEY}`);
            if (response.data.status === "OK") {
              const distance = response.data.rows[0].elements[0].distance.value / 1609.34; 
              let fee = 0;

              if (distance <= 1.5) {
                fee = 3;
              } else if (distance > 1.5 && distance <= 3) {
                fee = 5;
              } else if (distance > 3 && distance <= 7) {
                fee = 8;
              } else if (distance > 7 && distance <= 10) {
                fee = 10;
              }

              setOriginalDeliveryFee(fee);

              const { adjustedDeliveryFee, serviceFee, percentage1 } = calculateAdjustedDeliveryFee(parseFloat(calculateSubtotal()), fee);
              
              setServiceFee(serviceFee);

              setDeliveryFee(user.subscription === 1 ? 0 : parseFloat(adjustedDeliveryFee));
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
    setCheckoutModalVisible(true);
  };

  const confirmPayment = async () => {
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
          merchantDisplayName: "Bodega+",
          paymentIntentClientSecret: clientSecret,
          // Habilitar Apple Pay y Google Pay
          applePay: true, // Apple Pay
          googlePay: true, // Google Pay
          style: 'automatic', // o 'alwaysDark', 'alwaysLight'
          testEnv: true, // Solo en desarrollo, quítalo en producción
          allowsDelayedPaymentMethods: true,
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
    const deliveryAddress = {
      address: orderType === "Delivery" ? address : "",
      instructions: deliveryInstructions
    };

    const data = {
      delivery_fee: deliveryFee,
      total_price: total_price,
      oder_details: cart,
      local_id: currentShop,
      status: "new order",
      date_time: new Date().toISOString().slice(0, -5),
      pi: pi,
      type: orderType,
      savings: calculateSavings(),
      deliveryAddressAndInstructions: deliveryAddress,
      originalDeliveryFee,
      serviceFee,
      tip: calculateTipAmount(parseFloat(calculateSubtotal()))
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

  const selectAddress = (address) => {
    dispatch(setAddress(address.formatted_address));
    setModalVisible(false);
  };

  const confirmCheckout = () => {
    confirmPayment();
    setCheckoutModalVisible(false);
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
            <Text style={styles.orderTypeText}>User: {user.name}</Text>
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
            {orderType === 'Delivery' && <Text style={styles.summaryText}>Service Fee: ${serviceFee}</Text>}
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
          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={() => user.role === 'guest' ? setLoginModalVisible(true) : payment()} 
            disabled={isCheckoutLoading}
          >
            {isCheckoutLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            )}
          </TouchableOpacity>
          {/* Modal de confirmación de checkout */}
          <Modal
  visible={checkoutModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setCheckoutModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.largeModalContent}>
      <Text style={styles.modalTitle}>Confirm Your Order</Text>
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Delivery Address</Text>
          <Text style={styles.modalText}>{address}</Text>
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Enter Delivery Instructions</Text>
          <TextInput
            style={styles.instructionsInput}
            placeholder="Enter delivery instructions"
            placeholderTextColor="#A9A9A9"
            value={deliveryInstructions}
            onChangeText={setDeliveryInstructions}
            multiline
          />
        </View>
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.modalCartItem}>
              <Image source={{ uri: item.image }} style={styles.modalCartItemImage} />
              <View style={styles.modalCartItemDetails}>
                <Text style={styles.modalCartItemName}>{item.name}</Text>
                {item.selectedExtras && Object.keys(item.selectedExtras).length > 0 && (
                  <View style={styles.modalCartItemExtras}>
                    {Object.keys(item.selectedExtras).map((extraName) => (
                      <Text key={extraName} style={styles.modalCartItemExtraText}>
                        {extraName}: {item.selectedExtras[extraName].name} (${item.selectedExtras[extraName].price})
                      </Text>
                    ))}
                  </View>
                )}
                <View style={styles.row}>
                  <Text style={styles.modalCartItemPrice}>${(parseFloat(item.price.replace('$', '')) + (item.selectedExtras ? Object.values(item.selectedExtras).reduce((extraTotal, extra) => extraTotal + extra.price, 0) : 0)).toFixed(2)}</Text>
                  <Text style={styles.modalCartItemQuantity}>Qty: {item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.modalSummaryContainer}>
          <Text style={styles.summaryText}>Subtotal: ${calculateSubtotal()}</Text>
          {orderType === 'Delivery' && <Text style={styles.summaryText}>Service Fee: ${serviceFee}</Text>}
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
      </ScrollView>
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmCheckout}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setCheckoutModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
          {/* Fin del modal de confirmación de checkout */}
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
          <Modal
            visible={loginModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setLoginModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>To continue with the purchase, please log in or sign up</Text>
                  {loginMode ? (
                    <LoginForm setLoginMode={setLoginMode} handleLoginSuccess={() => setLoginModalVisible(false)} />
                  ) : (
                    <SignUpForm setLoginMode={setLoginMode} handleSignUpSuccess={() => setLoginModalVisible(false)} />
                  )}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setLoginModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
      )}
      <Toast />
    </SafeAreaView>
  );
};

const LoginForm = ({ setLoginMode, handleLoginSuccess }) => {
  const [clientData, setClientData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  const handleChange = (fieldName, value) => {
    setClientData(prevState => ({ ...prevState, [fieldName]: value }));

    let emailError = false;
    let passwordError = false;

    if (fieldName === 'email') {
      emailError = !value.trim() || !/^\S+@\S+\.\S+$/.test(value);
    } else if (fieldName === 'password') {
      passwordError = !value.trim();
    }

    setErrors({ email: emailError, password: passwordError });
  };

  const handleLogin = async () => {
    if (errors.email || errors.password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields correctly.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/loginUser`, { clientData, credentials: true });
      if (!response.data.error) {
        const _clientData = response.data;
        dispatch(setUser(_clientData));
        handleLoginSuccess();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: response.data.message || 'Invalid username or password.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('email', value)}
          style={[styles.input, { borderColor: errors.email ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          value={clientData.email}
          placeholder='Email Address'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="mail-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.email && <Text style={styles.errorText}>Valid email is required.</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('password', value)}
          style={[styles.input, { borderColor: errors.password ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          secureTextEntry={true}
          value={clientData.password}
          placeholder='Password'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="lock-closed-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.password && <Text style={styles.errorText}>Password is required.</Text>}
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setLoginMode(false)} style={styles.footerLink}>
        <Text style={styles.footerText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
};

const SignUpForm = ({ setLoginMode, handleSignUpSuccess }) => {
  const [clientData, setClientData] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [errors, setErrors] = useState({ name: false, email: false, password: false, confirmPassword: false, phone: false });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  const handleChange = (fieldName, value) => {
    setClientData(prevState => ({ ...prevState, [fieldName]: value }));

    let nameError = false;
    let emailError = false;
    let passwordError = false;
    let confirmPasswordError = false;
    let phoneError = false;

    if (fieldName === 'name') {
      nameError = !value.trim() || value.length > 45;
    } else if (fieldName === 'email') {
      emailError = !value.trim() || !/^\S+@\S+\.\S+$/.test(value);
    } else if (fieldName === 'password') {
      passwordError = !value.trim() || value.length < 6;
    } else if (fieldName === 'confirmPassword') {
      confirmPasswordError = value !== clientData.password;
    } else if (fieldName === 'phone') {
      phoneError = !value.trim();
    }

    setErrors({ name: nameError, email: emailError, password: passwordError, confirmPassword: confirmPasswordError, phone: phoneError });
  };

  const handleSignUp = async () => {
    const currentErrors = {
      name: !clientData.name.trim() || clientData.name.length > 45,
      email: !clientData.email.trim() || !/^\S+@\S+\.\S+$/.test(clientData.email),
      password: !clientData.password.trim() || clientData.password.length < 6,
      confirmPassword: clientData.confirmPassword !== clientData.password,
      phone: !clientData.phone.trim(),
    };

    setErrors(currentErrors);

    if (Object.values(currentErrors).some(error => error)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields correctly.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/registerUser`, { clientData, credentials: true });
      if (!response.data.error) {
        const _clientData = response.data;
        dispatch(setUser(_clientData));
        dispatch(fetchCategories());
        handleSignUpSuccess();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sign Up Error',
          text2: response.data.message || 'Error in server response.',
        });
      }
    } catch (error) {
      const backendErrors = error.response?.data?.errors || {};
      setErrors({
        name: backendErrors.name || currentErrors.name,
        email: backendErrors.email || currentErrors.email,
        password: backendErrors.password || currentErrors.password,
        confirmPassword: backendErrors.confirmPassword || currentErrors.confirmPassword,
        phone: backendErrors.phone || currentErrors.phone,
      });

      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('name', value)}
          style={[styles.input, { borderColor: errors.name ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          value={clientData.name}
          placeholder='Name'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="person-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.name && <Text style={styles.errorText}>Name is required and must be less than 45 characters.</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('email', value)}
          style={[styles.input, { borderColor: errors.email ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          value={clientData.email}
          placeholder='Email Address'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="mail-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.email && <Text style={styles.errorText}>Valid email is required.</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('password', value)}
          style={[styles.input, { borderColor: errors.password ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          secureTextEntry={true}
          value={clientData.password}
          placeholder='Password'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="lock-closed-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.password && <Text style={styles.errorText}>Password is required and must be at least 6 characters.</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('confirmPassword', value)}
          style={[styles.input, { borderColor: errors.confirmPassword ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          secureTextEntry={true}
          value={clientData.confirmPassword}
          placeholder='Confirm Password'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="lock-closed-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.confirmPassword && <Text style={styles.errorText}>Passwords do not match.</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('phone', value)}
          style={[styles.input, { borderColor: errors.phone ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
          value={clientData.phone}
          placeholder='Phone Number'
          placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
        />
        <Icon name="call-outline" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
      </View>
      {errors.phone && <Text style={styles.errorText}>Valid phone number is required.</Text>}
      <TouchableOpacity onPress={handleSignUp} style={styles.button} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setLoginMode(true)} style={styles.footerLink}>
        <Text style={styles.footerText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CartScreen;
