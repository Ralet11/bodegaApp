// CartScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  useColorScheme,
  Switch,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
  Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  incrementQuantity,
  decrementQuantity,
  clearCart,
  removeFromCart,
} from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '@env'; // Replace with your actual API URL
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setAddress } from '../redux/slices/user.slice';
import { setCurrentOrder, setOrderIn } from '../redux/slices/orders.slice';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import SelectAddressModal from '../components/modals/SelectYourAddressModal';
import CheckoutConfirmationModal from '../components/modals/CheckoutConfirmationModal';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const selectedExtrasArray = Object.values(item.selectedExtras || {}).flat();

  const itemPrice =
    typeof item.price === 'string'
      ? parseFloat(item.price.replace('$', ''))
      : item.price;

  const extrasTotal = selectedExtrasArray.reduce(
    (extraTotal, extra) =>
      extraTotal +
      (typeof extra.price === 'string'
        ? parseFloat(extra.price.replace('$', ''))
        : extra.price),
    0
  );

  const totalPrice = (itemPrice + extrasTotal).toFixed(2);

  const handleIncrement = () => {
    dispatch(incrementQuantity(item.id));
  };

  const handleDecrement = () => {
    dispatch(decrementQuantity(item.id));
  };

  return (
    <View
      style={[
        styles.cartItem,
        { backgroundColor: '#fff' },
      ]}
    >
      <Image source={{ uri: item.image || item.img }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text
          style={[
            styles.itemName,
            { color:  '#000' },
          ]}
        >
          {item.name}
        </Text>
        {/* Display extras */}
        {selectedExtrasArray.length > 0 && (
          <View style={styles.cartItemExtras}>
            {selectedExtrasArray.map((extra, index) => (
              <Text
                key={index}
                style={[
                  styles.cartItemExtraText,
                  { color: '#666' },
                ]}
              >
                {extra.name} (${extra.price})
              </Text>
            ))}
          </View>
        )}
        <View style={styles.priceRow}>
          <Text
            style={[
              styles.itemPrice,
              { color: '#000' },
            ]}
          >
            ${totalPrice}
          </Text>
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Discount</Text>
            </View>
          )}
          {item.promotion && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Promotion</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.quantityText,
            { color: '#000' },
          ]}
        >
          {item.quantity}
        </Text>
        <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const cart = useSelector((state) => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data.client);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address =
    useSelector((state) => state?.user?.address?.formatted_address) || '';
  const addressInfo = useSelector((state) => state?.user?.address) || '';
  const colorScheme = useColorScheme();
  const route = useRoute();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [newOrderType, setNewOrderType] = useState(
    route.params?.orderType || 'Pick-up'
  );
  const userAddresses =
    useSelector((state) => state?.user?.addresses) || [];
  const shops = useSelector((state) => state?.setUp?.shops);
  const shop = route.params?.shop;
  const [useBalance, setUseBalance] = useState(false);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [prevBalance, setPrevBalance] = useState(user?.balance || 0);
  const [finalPrice, setFinalPrice] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const orderType = newOrderType;
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const [serviceFee, setServiceFee] = useState(0);
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    addressInfo.additionalDetails || ''
  );
  const [isSubscribed, setIsSubscribed] = useState(user.subscription === 1);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your actual Google API key

  const handleBalanceChange = (value) => {
    setUseBalance(value);
    if (value) {
      setPrevBalance(balance);
    } else {
      setBalance(prevBalance);
    }
  };

  const openAddressInMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Open in Maps',
        'Would you like to open the address in Google Maps or Apple Maps?',
        [
          {
            text: 'Google Maps',
            onPress: () => Linking.openURL(googleMapsUrl),
          },
          {
            text: 'Apple Maps',
            onPress: () => Linking.openURL(appleMapsUrl),
          },
        ]
      );
    } else {
      Linking.openURL(googleMapsUrl);
    }
  };

  useEffect(() => {
    if (route.params && route.params.orderType) {
      setNewOrderType(route.params.orderType);
    }
  }, [route.params?.orderType]);

  const calculateSubtotal = () => {
    return cart
      .reduce((total, item) => {
        const itemPrice =
          typeof item.price === 'string'
            ? parseFloat(item.price.replace('$', ''))
            : item.price;

        const selectedExtrasArray = Object.values(
          item.selectedExtras || {}
        ).flat();

        const extrasTotal = selectedExtrasArray.reduce(
          (extraTotal, extra) =>
            extraTotal +
            (typeof extra.price === 'string'
              ? parseFloat(extra.price.replace('$', ''))
              : extra.price),
          0
        );

        return total + (itemPrice + extrasTotal) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const getOrderTypeDisplay = (type) => {
    switch (type) {
      case 'Delivery':
        return address;
      case 'Order-in':
        return 'Dine-in';
      default:
        return type;
    }
  };

  const calculateTax = () => {
    const taxRate = 0.08;
    const tax = calculateSubtotal() * taxRate;
    return user.subscription === 1 ? tax / 2 : tax;
  };

  const calculateTipAmount = (subtotal) => {
    const tipPercentage = parseFloat(tip) || parseFloat(customTip) || 0;
    return ((subtotal * tipPercentage) / 100).toFixed(2);
  };

  const calculateRealTotal = () => {
    const subtotal = parseFloat(calculateSubtotal()) || 0;
    const taxAmount = calculateTax(subtotal) || 0;
    const tipAmount = parseFloat(calculateTipAmount(subtotal)) || 0;
    const total =
      subtotal +
      taxAmount +
      tipAmount +
      (orderType === 'Delivery' ? deliveryFee + serviceFee : 0);

    return total.toFixed(2);
  };

  const calculateTotalAfterBalance = (realTotal) => {
    let finalTotal = realTotal;

    if (useBalance) {
      if (user.balance >= finalTotal) {
        finalTotal = 0;
      } else {
        finalTotal = Math.max(0, finalTotal - user.balance);
      }
    }

    return finalTotal.toFixed(2);
  };

  const calculateTotal = () => {
    const realTotal = parseFloat(calculateRealTotal());
    const finalTotal = calculateTotalAfterBalance(realTotal);
    return finalTotal;
  };

  const handleRemove = (item) => {
    dispatch(
      removeFromCart({ id: item.id, selectedExtras: item.selectedExtras })
    );
  };

  console.log(cart, "cart")

  const calculateSavings = () => {
    return cart
      .reduce((totalSavings, item) => {
        if (item.discount || item.promotion) {
          const savings =
            (parseFloat(item.originalPrice) - parseFloat(item.price)) *
            item.quantity;
          return totalSavings + savings;
        }
        return totalSavings;
      }, 0)
      .toFixed(2);
  };

  const findCurrentShop = () => {
    for (const categoryId in shops) {
      const shop = shops[categoryId].find((shop) => shop.id === currentShop);
      if (shop) {
        return shop;
      }
    }
    return null;
  };

  useEffect(() => {
    if (orderType === 'Delivery') {
      const currentShopDetails = findCurrentShop();

      const calculateAdjustedDeliveryFee = (
        orderTotal,
        calculatedDeliveryFee
      ) => {
        const companyShare = orderTotal * 0.2;
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
            const response = await Axios.get(
              `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${encodeURIComponent(
                address
              )}&destinations=${encodeURIComponent(
                currentShopDetails.address
              )}&key=${GOOGLE_API_KEY}`
            );
            if (response.data.status === 'OK') {
              const distance =
                response.data.rows[0].elements[0].distance.value / 1609.34;
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

              const { adjustedDeliveryFee, serviceFee } =
                calculateAdjustedDeliveryFee(
                  parseFloat(calculateSubtotal()),
                  fee
                );

              setServiceFee(parseFloat(serviceFee));

              setDeliveryFee(
                user.subscription === 1 ? 0 : parseFloat(adjustedDeliveryFee)
              );
            } else {
              console.error(
                'Error fetching distance from Google Maps API:',
                response.data
              );
              Alert.alert(
                'Error',
                'Failed to calculate delivery fee. Please try again.'
              );
            }
            setIsLoading(false);
          } catch (error) {
            console.error(
              'Error fetching distance from Google Maps API:',
              error
            );
            Alert.alert(
              'Error',
              'Failed to calculate delivery fee. Please try again.'
            );
            setIsLoading(false);
          }
        };

        calculateDeliveryFee();
      } else {
        setIsLoading(false);
        Alert.alert(
          'Error',
          'Selected shop not found or address is empty.'
        );
      }
    } else {
      setIsLoading(false);
    }
  }, [address, currentShop, user.subscription, shops]);

  const handleIncrement = (item) => {
    if (item.extras && Object.keys(item.extras).length > 0) {
      navigation.navigate('ProductDetail', { product: item });
    } else if (item.discount) {
      navigation.navigate('DiscountDetail', { discount: item });
    } else {
      dispatch(incrementQuantity(item.id));
    }
  };

  const payment = async () => {
    setCheckoutModalVisible(true);
  };

  const confirmPayment = async () => {
    if (isLoading || isCheckoutLoading) {
      Alert.alert('Please wait', 'Calculating delivery fee...');
      return;
    }

    setIsCheckoutLoading(true);

    const total_price = parseFloat(calculateTotal());

    try {
      if (total_price > 0) {
        const response = await Axios.post(`${API_URL}/api/payment/intent`, {
          finalPrice: Math.floor(total_price * 100),
        });
        const { clientSecret } = response.data;

        if (response.error) {
          Alert.alert('Something went wrong');
          setIsCheckoutLoading(false);
          return;
        }

        const paymentIntentId = clientSecret.split('_secret')[0];

        const initResponse = await initPaymentSheet({
          merchantDisplayName: 'YourAppName',
          paymentIntentClientSecret: clientSecret,
          applePay: true,
          googlePay: true,
          style: 'automatic',
          testEnv: true,
          allowsDelayedPaymentMethods: true,
        });

        if (initResponse.error) {
          console.log(initResponse.error);
          Alert.alert('Something went wrong');
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
        handleOrder('balancePayment');
      }
    } catch (error) {
      console.error('Error during payment request:', error);
      Alert.alert(
        'Error',
        'There was an error processing your payment. Please try again.'
      );
      setIsCheckoutLoading(false);
    }
  };

  const handleOrderTypeChange = (type) => {
    setNewOrderType(type);
  
  };

  const confirmOrderTypeChange = () => {
    navigation.setParams({ orderType: newOrderType });
    setConfirmationModalVisible(false);
  };

  const handleOrder = async (pi) => {
    const realTotalPrice = parseFloat(calculateRealTotal());
    const totalPriceAfterBalance = parseFloat(
      calculateTotalAfterBalance(realTotalPrice)
    );

    const deliveryAddress = {
      address: orderType === 'Delivery' ? address : '',
      instructions: deliveryInstructions,
    };

    const hasPromotion = cart.some((item) => item.promotion);

    const data = {
      delivery_fee: deliveryFee,
      total_price: realTotalPrice,
      amount_paid: totalPriceAfterBalance,
      order_details: cart,
      local_id: currentShop,
      status: 'new order',
      date_time: new Date().toISOString().slice(0, -5),
      pi: pi,
      type: orderType,
      savings: calculateSavings(),
      deliveryAddressAndInstructions: deliveryAddress,
      originalDeliveryFee,
      serviceFee,
      tip: calculateTipAmount(parseFloat(calculateSubtotal())),
      promotion: hasPromotion ? true : false,
    };

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await Axios.post(`${API_URL}/api/orders/add`, data, {
        headers,
      });

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
        const newBalance = Math.max(user.balance - realTotalPrice, 0);

        const data = { newBalance };

        await Axios.put(
          `${API_URL}/api/users/removeUserBalance`,
          data,
          { headers }
        );

        const updatedUser = {
          ...user,
          balance: newBalance,
        };

        dispatch(setUser({ data: { client: updatedUser, token } }));
        setBalance(newBalance);
      }

      dispatch(setCurrentOrder(response.data.newOrder));
      if (response.data.newOrder.type === 'Delivery') {
        navigation.navigate('AcceptedOrder');
      } else {
        navigation.navigate('PickUpOrderFinish');
      }

      for (const item of cart) {
        if (item.discount) {
          try {
            const id = { id: item.discountId };
            await Axios.post(`${API_URL}/api/discounts/useDiscount`, id, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (error) {
            console.log('Error applying discount', error);
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    if (cart.length === 0) {
      navigation.goBack();
    }
  }, [cart, navigation]);

  const selectAddress = (address) => {
    dispatch(setAddress(address.formatted_address));
    setModalVisible(false);
  };

  const confirmCheckout = () => {
    confirmPayment();
    setCheckoutModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#f5f5f5' }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: '#fff' }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.orderTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === 'Pick-up' && styles.orderTypeButtonActive,
                ]}
                onPress={() => handleOrderTypeChange('Pick-up')}
              >
                <Text
                  style={[
                    styles.orderTypeButtonText,
                    orderType === 'Pick-up' && styles.orderTypeButtonTextActive,
                  ]}
                >
                  Pickup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === 'Order-in' && styles.orderTypeButtonActive,
                ]}
                onPress={() => handleOrderTypeChange('Order-in')}
              >
                <Text
                  style={[
                    styles.orderTypeButtonText,
                    orderType === 'Order-in' && styles.orderTypeButtonTextActive,
                  ]}
                >
                  Dine-in
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => dispatch(clearCart())}>
              <Text style={[styles.emptyCartText, { color: '#FFA500' }]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
  
          <ScrollView style={styles.cartItemsContainer}>
            {/* Address Section (if Delivery) */}
            {orderType === 'Delivery' && (
              <View style={[styles.addressContainer, { backgroundColor: '#fff' }]}>
                <Text style={[styles.addressLabel, { color: '#000' }]}>
                  Delivery Address:
                </Text>
                <View style={styles.addressInputContainer}>
                  <TextInput
                    style={[
                      styles.addressInput,
                      { color: '#000', borderColor: '#e0e0e0' },
                    ]}
                    placeholder="Enter your address"
                    placeholderTextColor="#A9A9A9"
                    value={address}
                    editable={false}
                  />
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="location-outline" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
  
            {/* Restaurant Info */}
            <TouchableOpacity onPress={() => openAddressInMaps(shop?.address)}>
              <View style={[styles.restaurantInfo, { backgroundColor: '#fff' }]}>
                <View style={styles.restaurantDetails}>
                  <Text style={[styles.restaurantName, { color: '#000' }]}>
                    {shop?.name}
                  </Text>
                  <Text style={[styles.restaurantAddress, { color: '#666' }]}>
                    {shop?.address}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
  
            {/* Cart Items */}
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
  
            {/* Tip Section */}
            {orderType === 'Delivery' && (
              <View style={[styles.tipContainer, { backgroundColor: '#fff' }]}>
                <Text style={[styles.tipLabel, { color: '#000' }]}>Tip:</Text>
                <View style={styles.tipOptions}>
                  {[0, 5, 10, 15, 20].map((percentage) => (
                    <TouchableOpacity
                      key={percentage}
                      style={[
                        styles.tipButton,
                        tip === percentage && styles.tipButtonSelected,
                        { backgroundColor: '#f0f0f0' },
                      ]}
                      onPress={() => {
                        setTip(percentage);
                        setCustomTip('');
                      }}
                    >
                      <Text style={[styles.tipButtonText, { color: '#000' }]}>
                        {percentage}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.tipButton,
                      customTip !== '' && styles.tipButtonSelected,
                      { backgroundColor: '#f0f0f0' },
                    ]}
                    onPress={() => {
                      setTip('');
                      setCustomTip('');
                    }}
                  >
                    <Text style={[styles.tipButtonText, { color: '#000' }]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
                {tip === '' && (
                  <TextInput
                    style={[
                      styles.customTipInput,
                      { color: '#000', borderColor: '#e0e0e0' },
                    ]}
                    placeholder="Enter custom tip percentage"
                    placeholderTextColor="#A9A9A9"
                    keyboardType="numeric"
                    value={customTip}
                    onChangeText={(text) =>
                      setCustomTip(text.replace(/[^0-9.]/g, ''))
                    }
                  />
                )}
              </View>
            )}
          </ScrollView>
  
          {/* Summary */}
          <View style={[styles.summaryContainer, { backgroundColor: '#fff' }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#000' }]}>
                Subtotal:
              </Text>
              <Text style={[styles.summaryValue, { color: '#000' }]}>
                ${calculateSubtotal()}
              </Text>
            </View>
  
            {orderType === 'Delivery' && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#000' }]}>
                  Service Fee:
                </Text>
                <Text style={[styles.summaryValue, { color: '#000' }]}>
                  ${serviceFee.toFixed(2)}
                </Text>
              </View>
            )}
  
            {orderType === 'Delivery' && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#000' }]}>
                  Delivery Fee:
                </Text>
                {isSubscribed ? (
                  <View style={styles.feeContainer}>
                    <Text
                      style={[styles.summaryValue, styles.strikethrough, { color: '#000' }]}
                    >
                      ${deliveryFee.toFixed(2)}
                    </Text>
                    <Text style={[styles.summaryValue, styles.freeText, { color: '#4CAF50' }]}>
                      Free
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.summaryValue, { color: '#000' }]}>
                    ${deliveryFee.toFixed(2)}
                  </Text>
                )}
              </View>
            )}
  
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#000' }]}>Tax:</Text>
              {isSubscribed ? (
                <View style={styles.feeContainer}>
                  <Text
                    style={[styles.summaryValue, styles.strikethrough, { color: '#000' }]}
                  >
                    ${(calculateTax() * 2).toFixed(2)}
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#000' }]}>
                    ${calculateTax().toFixed(2)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.summaryValue, { color: '#000' }]}>
                  ${calculateTax().toFixed(2)}
                </Text>
              )}
            </View>
  
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: '#000' }]}>Total:</Text>
              <Text style={[styles.totalValue, { color: '#000' }]}>
                ${calculateRealTotal()}
              </Text>
            </View>
          </View>
  
          {/* Checkout Button */}
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() =>
              user.role === 'guest' ? setLoginModalVisible(true) : payment()
            }
            disabled={isCheckoutLoading || isLoading}
          >
            {isCheckoutLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            )}
          </TouchableOpacity>
  
          {/* Modals */}
          {/* Checkout Confirmation Modal */}
          <CheckoutConfirmationModal
            visible={checkoutModalVisible}
            onClose={() => setCheckoutModalVisible(false)}
            onConfirm={confirmCheckout}
            orderType={orderType}
            getOrderTypeDisplay={getOrderTypeDisplay}
            deliveryInstructions={deliveryInstructions}
            setDeliveryInstructions={setDeliveryInstructions}
            addressInfo={addressInfo}
            cart={cart}
            calculateSubtotal={calculateSubtotal}
            serviceFee={serviceFee}
            user={user}
            originalDeliveryFee={originalDeliveryFee}
            deliveryFee={deliveryFee}
            calculateTax={calculateTax}
            calculateTipAmount={calculateTipAmount}
            calculateTotal={calculateTotal}
            address={address}
            styles={styles}
            calculateSavings={calculateSavings} 
          />
  
          {/* Address Selection Modal */}
          <SelectAddressModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            addresses={userAddresses}
            onSelectAddress={selectAddress}
            styles={styles}
          />
        </>
      )}
      <Toast />
    </SafeAreaView>
  );
  
};

// LoginForm Component
const LoginForm = ({ setLoginMode, handleLoginSuccess }) => {
  const [clientData, setClientData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  const handleChange = (fieldName, value) => {
    setClientData((prevState) => ({ ...prevState, [fieldName]: value }));

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
      const response = await Axios.post(`${API_URL}/api/auth/loginUser`, {
        clientData,
        credentials: true,
      });
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
        text2:
          error.response?.data?.message ||
          error.message ||
          'Something went wrong. Please try again later.',
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
          style={[
            styles.input,
            {
              borderColor: errors.email
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          value={clientData.email}
          placeholder="Email Address"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="mail-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.email && (
        <Text style={styles.errorText}>Valid email is required.</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('password', value)}
          style={[
            styles.input,
            {
              borderColor: errors.password
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          secureTextEntry={true}
          value={clientData.password}
          placeholder="Password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="lock-closed-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.password && (
        <Text style={styles.errorText}>Password is required.</Text>
      )}
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      >
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

// SignUpForm Component
const SignUpForm = ({ setLoginMode, handleSignUpSuccess }) => {
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();

  const handleChange = (fieldName, value) => {
    setClientData((prevState) => ({ ...prevState, [fieldName]: value }));

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

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      phone: phoneError,
    });
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

    if (Object.values(currentErrors).some((error) => error)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all fields correctly.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/registerUser`, {
        clientData,
        credentials: true,
      });
      if (!response.data.error) {
        const _clientData = response.data;
        dispatch(setUser(_clientData));
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
        text2:
          error.response?.data?.message ||
          error.message ||
          'Something went wrong. Please try again later.',
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
          style={[
            styles.input,
            {
              borderColor: errors.name
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          value={clientData.name}
          placeholder="Name"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="person-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.name && (
        <Text style={styles.errorText}>
          Name is required and must be less than 45 characters.
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('email', value)}
          style={[
            styles.input,
            {
              borderColor: errors.email
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          value={clientData.email}
          placeholder="Email Address"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="mail-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.email && (
        <Text style={styles.errorText}>Valid email is required.</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('password', value)}
          style={[
            styles.input,
            {
              borderColor: errors.password
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          secureTextEntry={true}
          value={clientData.password}
          placeholder="Password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="lock-closed-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.password && (
        <Text style={styles.errorText}>
          Password is required and must be at least 6 characters.
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('confirmPassword', value)}
          style={[
            styles.input,
            {
              borderColor: errors.confirmPassword
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          secureTextEntry={true}
          value={clientData.confirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="lock-closed-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.confirmPassword && (
        <Text style={styles.errorText}>Passwords do not match.</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(value) => handleChange('phone', value)}
          style={[
            styles.input,
            {
              borderColor: errors.phone
                ? 'red'
                : colorScheme === 'dark'
                ? '#FFF'
                : '#ccc',
              color: colorScheme === 'dark' ? '#fff' : '#000',
            },
          ]}
          value={clientData.phone}
          placeholder="Phone Number"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#888'}
        />
        <Icon
          name="call-outline"
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </View>
      {errors.phone && (
        <Text style={styles.errorText}>Valid phone number is required.</Text>
      )}
      <TouchableOpacity
        onPress={handleSignUp}
        style={styles.button}
        disabled={loading}
      >
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

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  orderTypeButtonActive: {
    backgroundColor: '#FFA500',
  },
  orderTypeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  orderTypeButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Address Container
  addressContainer: {
    padding: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  // Restaurant Info
  restaurantInfo: {
    padding: 16,
  },
  restaurantDetails: {},
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Cart Items
  cartItemsContainer: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemExtras: {
    marginBottom: 4,
  },
  cartItemExtraText: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 16,
  },
  // Tip Section
  tipContainer: {
    padding: 16,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tipButtonSelected: {
    backgroundColor: '#FFA500',
  },
  tipButtonText: {
    fontSize: 14,
  },
  customTipInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  // Balance Section
  balanceContainer: {
    padding: 16,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  useBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  useBalanceLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  // Summary Section
  summaryContainer: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 8,
  },
  freeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  totalRow: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Savings and Ad
  savingsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adContainer: {
    padding: 16,
    alignItems: 'center',
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  adText: {
    fontSize: 14,
    marginTop: 4,
  },
  // Checkout Button
  checkoutButton: {
    backgroundColor: '#333',
    padding: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOrderTypeContainer: {
    width: '80%',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalOrderTypeText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFA500',
    borderRadius: 4,
    marginRight: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
  },
  // Login Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    padding: 16,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: '#FFA500',
    fontSize: 16,
  },
  // Form Styles
  formContainer: {
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: -12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  footerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#FFA500',
  },
});

export default CartScreen;
