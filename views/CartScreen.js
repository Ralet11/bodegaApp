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
  ActivityIndicator,
  useColorScheme,
  Platform,
  Linking,
  StyleSheet,
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
import { API_URL } from '@env';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setCurrentOrder, setOrderIn } from '../redux/slices/orders.slice';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import CheckoutConfirmationModal from '../components/modals/CheckoutConfirmationModal';

const TAX_RATE = 0.08;

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  const selectedExtrasArray = Object.values(item.selectedExtras || {}).flat();

  // Se usa finalPrice para el precio final
  const itemFinalPrice = Number(item.finalPrice) || 0;
  const extrasTotal = selectedExtrasArray.reduce(
    (extraTotal, extra) =>
      extraTotal +
      (typeof extra.price === 'string'
        ? parseFloat(extra.price.replace('$', ''))
        : extra.price),
    0
  );
  // Si se quiere quitar la lógica de extras, se ignoran extrasTotal
  const totalPrice = (itemFinalPrice * item.quantity).toFixed(2);

  const handleIncrement = () => {
    dispatch(incrementQuantity(item.id));
  };

  const handleDecrement = () => {
    dispatch(decrementQuantity(item.id));
  };

  return (
    <View style={[styles.cartItem, { backgroundColor: '#fff' }]}>
      <Image source={{ uri: item.image || item.img }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: '#000' }]}>{item.name}</Text>
        {/* Se elimina la lógica de extras */}
        <View style={styles.priceRow}>
          <Text style={[styles.itemPrice, { color: '#000' }]}>
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
        <Text style={[styles.quantityText, { color: '#000' }]}>{item.quantity}</Text>
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
  const colorScheme = useColorScheme();
  const route = useRoute();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [newOrderType, setNewOrderType] = useState(route.params?.orderType || 'Pick-up');
  const shop = route.params?.shop;
  const [useBalance, setUseBalance] = useState(false);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [prevBalance, setPrevBalance] = useState(user?.balance || 0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const constOrderType = newOrderType;
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const isFocused = useIsFocused();

  // Funciones de cálculo usando finalPrice sin extras
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemFinalPrice = Number(item.finalPrice) || 0;
      return total + itemFinalPrice * item.quantity;
    }, 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * TAX_RATE;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmt = calculateTax(subtotal);
    const totalBeforeBalance = subtotal + taxAmt;
    if (useBalance) {
      return user.balance >= totalBeforeBalance
        ? 0
        : totalBeforeBalance - user.balance;
    }
    return totalBeforeBalance;
  };

  // Función para calcular el total ahorrado (savings)
  const calculateSavings = () => {
    return cart.reduce((totalSavings, item) => {
      const original = Number(item.price) || 0;
      const final = Number(item.finalPrice) || 0;
      const diff = original - final;
      return totalSavings + (diff > 0 ? diff * item.quantity : 0);
    }, 0);
  };

  useEffect(() => {
    if (isFocused && cart.length === 0) {
      navigation.goBack();
    }
  }, [isFocused, cart.length, navigation]);

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
      Alert.alert('Por favor espera', 'Procesando pago...');
      return;
    }

    setIsCheckoutLoading(true);
    const subtotal = calculateSubtotal();
    const taxAmt = calculateTax(subtotal);
    const totalBeforeBalance = subtotal + taxAmt;
    const finalTotal =
      useBalance && user.balance >= totalBeforeBalance
        ? 0
        : useBalance
        ? totalBeforeBalance - user.balance
        : totalBeforeBalance;

    try {
      if (finalTotal > 0) {
        const response = await Axios.post(`${API_URL}/api/payment/intent`, {
          finalPrice: Math.floor(finalTotal * 100),
        });
        const { clientSecret } = response.data;

        if (response.error) {
          Alert.alert('Algo salió mal');
          setIsCheckoutLoading(false);
          return;
        }

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
          Alert.alert('Algo salió mal');
          setIsCheckoutLoading(false);
          return;
        }

        const { error } = await presentPaymentSheet();

        if (error) {
          console.log(error);
          Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
          handleOrder(clientSecret.split('_secret')[0]);
        }
      } else {
        handleOrder('balancePayment');
      }
    } catch (error) {
      console.error('Error en el pago:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error procesando el pago. Inténtalo nuevamente.'
      );
      setIsCheckoutLoading(false);
    }
  };

  const handleOrder = async (pi) => {
    const subtotal = calculateSubtotal();
    const taxAmt = calculateTax(subtotal);
    const totalBeforeBalance = subtotal + taxAmt;
    const finalTotal =
      useBalance && user.balance >= totalBeforeBalance
        ? 0
        : useBalance
        ? totalBeforeBalance - user.balance
        : totalBeforeBalance;

    // Calcular el ahorro total usando la función calculateSavings
    const savings = calculateSavings();

    const data = {
      total_price: totalBeforeBalance.toFixed(2),
      amount_paid: finalTotal.toFixed(2),
      order_details: cart,
      local_id: currentShop,
      status: 'new order',
      date_time: new Date().toISOString().slice(0, -5),
      pi: pi,
      type: constOrderType,
      savings: savings.toFixed(2),
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
        const newBalance = Math.max(user.balance - totalBeforeBalance, 0);
        const balanceData = { newBalance };

        await Axios.put(`${API_URL}/api/users/removeUserBalance`, balanceData, {
          headers,
        });

        const updatedUser = {
          ...user,
          balance: newBalance,
        };

        dispatch(setUser({ data: { client: updatedUser, token } }));
        setBalance(newBalance);
      }

      dispatch(setCurrentOrder(response.data.newOrder));

      // Navegación según el tipo de orden (Pick-up o Dine-in)
      navigation.navigate('PickUpOrderFinish');
    } catch (error) {
      console.error('Error durante la creación de la orden:', error.message);
      Alert.alert(
        'Error',
        'Ocurrió un problema procesando tu orden. Inténtalo más tarde.'
      );
    }
  };

  // Variables para el resumen
  const subtotal = calculateSubtotal();
  const taxAmt = calculateTax(subtotal);
  const totalBeforeBalance = subtotal + taxAmt;
  const finalTotal =
    useBalance && user.balance >= totalBeforeBalance
      ? 0
      : useBalance
      ? totalBeforeBalance - user.balance
      : totalBeforeBalance;

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
                  constOrderType === 'Pick-up' && styles.orderTypeButtonActive,
                ]}
                onPress={() => setNewOrderType('Pick-up')}
              >
                <Text
                  style={[
                    styles.orderTypeButtonText,
                    constOrderType === 'Pick-up' && styles.orderTypeButtonTextActive,
                  ]}
                >
                  Pickup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  constOrderType === 'Dine-in' && styles.orderTypeButtonActive,
                ]}
                onPress={() => setNewOrderType('Dine-in')}
              >
                <Text
                  style={[
                    styles.orderTypeButtonText,
                    constOrderType === 'Dine-in' && styles.orderTypeButtonTextActive,
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
            {/* Información del Restaurante */}
            <TouchableOpacity
              onPress={() => {
                const encodedAddress = encodeURIComponent(shop?.address);
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                Linking.openURL(googleMapsUrl);
              }}
            >
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

            {/* Items del Carrito */}
            {cart.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </ScrollView>

          {/* Resumen de la Orden */}
          <View style={[styles.summaryContainer, { backgroundColor: '#fff' }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#000' }]}>
                Subtotal:
              </Text>
              <Text style={[styles.summaryValue, { color: '#000' }]}>
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#000' }]}>
                Tax (8%):
              </Text>
              <Text style={[styles.summaryValue, { color: '#000' }]}>
                ${taxAmt.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: '#000' }]}>
                Total:
              </Text>
              <Text style={[styles.totalValue, { color: '#000' }]}>
                ${finalTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Botón de Checkout */}
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

          {/* Checkout Confirmation Modal */}
          <CheckoutConfirmationModal
            visible={checkoutModalVisible}
            onClose={() => setCheckoutModalVisible(false)}
            onConfirm={confirmPayment}
            orderType={constOrderType}
            cart={cart}
            calculateSubtotal={calculateSubtotal}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
          />
        </>
      )}
      <Toast />
    </SafeAreaView>
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
  // Form & Modal Styles
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
