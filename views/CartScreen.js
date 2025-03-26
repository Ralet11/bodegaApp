// CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  incrementQuantity,
  decrementQuantity,
  clearCart,
} from '../redux/slices/cart.slice';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import {
  useStripe,
  usePlatformPay,
  PlatformPayButton,
} from '@stripe/stripe-react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { setCurrentOrder, setOrderIn } from '../redux/slices/orders.slice';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';

// Importar el nuevo modal
import CheckoutConfirmationModal from '../components/modals/CheckoutConfirmationModal';

const TAX_RATE = 0.08;

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const itemFinalPrice = Number(item.finalPrice) || 0;
  const totalPrice = (itemFinalPrice * item.quantity).toFixed(2);

  const handleIncrement = () => dispatch(incrementQuantity(item.id));
  const handleDecrement = () => dispatch(decrementQuantity(item.id));

  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image || item.img }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>${totalPrice}</Text>
          {/* Si existe un descuento o promoción */}
          {item.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Discount</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CartScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Redux state
  const cart = useSelector((state) => state.cart.items);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const user = useSelector((state) => state.user.userInfo.data.client);
  const token = useSelector((state) => state.user.userInfo.data.token);

  // Stripe PaymentSheet
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  // Native ApplePay/GooglePay
  const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();

  const route = useRoute();
  const shop = route.params?.shop;
  const [newOrderType, setNewOrderType] = useState(
    route.params?.orderType || 'Pick-up'
  );
  const orderType = newOrderType;

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Para Apple/Google Pay
  const [clientSecretPlatform, setClientSecretPlatform] = useState('');
  const [readyForPlatformPay, setReadyForPlatformPay] = useState(false);

  // Estado para el modal de confirmación
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // ------------------------------------------------------------------
  //  Cálculos de Carrito
  // ------------------------------------------------------------------
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const finalPrice = Number(item.finalPrice) || 0;
      return sum + finalPrice * item.quantity;
    }, 0);
  };

  const calculateTax = (subtotal) => subtotal * TAX_RATE;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal);
    return subtotal + taxAmount;
  };

  // Cálculo de savings (similares a CheckoutConfirmationModal)
  const calculateSavings = () => {
    return cart.reduce((totalSavings, item) => {
      const original = Number(item.price) || 0;
      const final = Number(item.finalPrice) || 0;
      const diff = original - final; // diferencia entre precio original y final
      return totalSavings + (diff > 0 ? diff * item.quantity : 0);
    }, 0);
  };

  // Si no hay items, volvemos atrás
  useEffect(() => {
    if (isFocused && cart.length === 0) {
      navigation.goBack();
    }
  }, [isFocused, cart, navigation]);

  // ------------------------------------------------------------------
  //  Lógica de mostrar modal antes de hacer el pago
  // ------------------------------------------------------------------
  const openConfirmationModal = (method) => {
    setSelectedPaymentMethod(method);
    setConfirmationVisible(true);
  };

  const handleConfirm = () => {
    // Cerramos el modal
    setConfirmationVisible(false);
    // Decidimos la forma de pago en base al método seleccionado
    if (selectedPaymentMethod === 'card') {
      preparePaymentSheet();
    } else if (selectedPaymentMethod === 'appleGoogle') {
      setupPlatformPay();
    }
  };

  const handleCancel = () => {
    setConfirmationVisible(false);
  };

  // ------------------------------------------------------------------
  //  Pago con Tarjeta (PaymentSheet)
  // ------------------------------------------------------------------
  const preparePaymentSheet = async () => {
    try {
      setIsCheckoutLoading(true);

      const total = calculateTotal();
      // Creamos PaymentIntent en backend
      const response = await Axios.post(`${API_URL}/api/payment/intent`, {
        finalPrice: Math.round(total * 100),
        activeShop: currentShop,
      });

      const { clientSecret } = response.data;

      const initResponse = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'MyApp',
        applePay: {
          merchantCountryCode: 'US',
        },
        googlePay: {
          merchantCountryCode: 'US',
        },
        testEnv: true,
        style: 'automatic',
        allowsDelayedPaymentMethods: true,
      });

      if (initResponse.error) {
        Alert.alert('Error', initResponse.error.message);
        setIsCheckoutLoading(false);
        return;
      }

      // Presentamos el PaymentSheet
      openPaymentSheet(clientSecret);
    } catch (error) {
      console.error('Error preparando PaymentSheet:', error);
      Alert.alert('Error', 'No se pudo inicializar el PaymentSheet.');
      setIsCheckoutLoading(false);
    }
  };

  const openPaymentSheet = async (clientSecret) => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        // Pago completado
        handleOrder(clientSecret.split('_secret')[0]);
      }
    } catch (error) {
      console.error('Error presentando PaymentSheet:', error);
      Alert.alert('Error', 'No se pudo presentar el PaymentSheet.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // ------------------------------------------------------------------
  //  Pago con Apple Pay / Google Pay
  // ------------------------------------------------------------------
  const setupPlatformPay = async () => {
    try {
      const supported = await isPlatformPaySupported();
      if (!supported) {
        Alert.alert(
          'No soportado',
          'Tu dispositivo no soporta Apple Pay o Google Pay'
        );
        return;
      }

      const total = calculateTotal();
      if (total === 0) {
        Alert.alert('Carrito vacío', 'No hay nada para pagar');
        return;
      }

      const response = await Axios.post(`${API_URL}/api/payment/intent`, {
        finalPrice: Math.round(total * 100),
        activeShop: currentShop,
      });

      setClientSecretPlatform(response.data.clientSecret);
      setReadyForPlatformPay(true);
    } catch (error) {
      console.error('Error configurando Apple/Google Pay:', error);
      Alert.alert(
        'Error',
        'No fue posible crear el PaymentIntent para Apple/Google Pay'
      );
    }
  };

  const payWithPlatformPay = async () => {
    try {
      setReadyForPlatformPay(false);

      const total = calculateTotal();
      const cartItems = [
        {
          label: 'Products',
          amount: total.toFixed(2),
          paymentType: 'Immediate',
        },
        {
          label: 'Total',
          amount: total.toFixed(2),
          paymentType: 'Immediate',
        },
      ];

      const { error } = await confirmPlatformPayPayment(clientSecretPlatform, {
        applePay: {
          cartItems,
          merchantCountryCode: 'US',
          currencyCode: 'USD',
        },
      });

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        setReadyForPlatformPay(true);
      } else {
        // Éxito, pago completado
        handleOrder(clientSecretPlatform.split('_secret')[0]);
      }
    } catch (err) {
      console.error('Error en Apple/Google Pay:', err);
      Alert.alert(
        'Error',
        'Ocurrió un problema con Apple Pay / Google Pay'
      );
      setReadyForPlatformPay(true);
    }
  };

  // ------------------------------------------------------------------
  //  Crear Orden en backend
  // ------------------------------------------------------------------
  const handleOrder = async (pi) => {
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTax(subtotal);
    const totalBeforeBalance = subtotal + taxAmount;

    const data = {
      total_price: totalBeforeBalance.toFixed(2),
      amount_paid: totalBeforeBalance.toFixed(2),
      order_details: cart,
      local_id: currentShop,
      status: 'new order',
      date_time: new Date().toISOString().slice(0, -5),
      pi,
      type: orderType,
      savings: '0.00', // Ajustar si hay descuentos
    };

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await Axios.post(`${API_URL}/api/orders/add`, data, {
        headers,
      });

      // Guardamos la orden en Redux
      dispatch(setOrderIn(response.data.newOrder));
      // Actualizamos el usuario en Redux (si cambian puntos o algo similar)
      dispatch(
        setUser({ data: { client: response.data.userUpdate, token } })
      );
      // Limpiamos el carrito
      dispatch(clearCart());
      // Seteamos la orden actual
      dispatch(setCurrentOrder(response.data.newOrder));

      // Navegamos a la pantalla final
      navigation.navigate('PickUpOrderFinish');
    } catch (error) {
      console.error('Error guardando la orden:', error);
      Alert.alert('Error', 'No se pudo crear la orden en el backend');
    }
  };

  // ------------------------------------------------------------------
  //  Render
  // ------------------------------------------------------------------
  const subtotal = calculateSubtotal();
  const taxAmount = calculateTax(subtotal);
  const finalTotal = subtotal + taxAmount;
  const savings = calculateSavings();

  // Texto dinámico para Apple Pay o Google Pay
  const prepareButtonText = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.orderTypeSelector}>
          <View style={[styles.orderTypeButton, styles.orderTypeButtonActive]}>
            <Text style={[styles.orderTypeButtonText, styles.orderTypeButtonTextActive]}>
              {newOrderType}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFA500' }}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* LISTA DE PRODUCTOS EN CARRITO */}
      <ScrollView style={styles.cartItemsContainer}>
        {shop && (
          <TouchableOpacity
            onPress={() => {
              const encodedAddress = encodeURIComponent(shop.address);
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
              Linking.openURL(googleMapsUrl);
            }}
          >
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{shop.name}</Text>
              <Text style={styles.restaurantAddress}>{shop.address}</Text>
            </View>
          </TouchableOpacity>
        )}

        {cart.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* RESUMEN DE COMPRA */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (8%):</Text>
          <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
        </View>

        {/* Mostrar savings si es mayor a 0 */}
        {savings > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Savings:</Text>
            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
              -${savings.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* BOTONES DE PAGO */}
      <View style={{ padding: 16 }}>
        {/* Pago con Tarjeta */}
        <TouchableOpacity
          style={[styles.checkoutButton, { marginBottom: 10 }]}
          onPress={() => openConfirmationModal('card')}
          disabled={isCheckoutLoading}
        >
          {isCheckoutLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Pay with Card</Text>
          )}
        </TouchableOpacity>

        {/* Pago con Apple Pay / Google Pay */}
        {isPlatformPaySupported && (
          <>
            {!readyForPlatformPay ? (
              <TouchableOpacity
                style={[styles.checkoutButton, { backgroundColor: '#666' }]}
                onPress={() => openConfirmationModal('appleGoogle')}
              >
                <Text style={styles.checkoutButtonText}>
                  {prepareButtonText}
                </Text>
              </TouchableOpacity>
            ) : (
              <PlatformPayButton
                onPress={payWithPlatformPay}
                type="buy"
                style={styles.payButton}
              />
            )}
          </>
        )}
      </View>

      {/* MODAL DE CONFIRMACIÓN (CheckoutConfirmationModal) */}
      <CheckoutConfirmationModal
        visible={confirmationVisible}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        orderType={orderType}
        cart={cart}
        calculateSubtotal={calculateSubtotal}
        calculateTax={calculateTax}
        calculateTotal={calculateTotal}
      />

      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
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
  cartItemsContainer: {
    flex: 1,
  },
  restaurantInfo: {
    backgroundColor: '#fff',
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
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
    color: '#000',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#000',
  },
  discountBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
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
    color: '#000',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#fff',
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
    color: '#000',
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
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#333',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  payButton: {
    width: '100%',
    height: 50,
    marginTop: 8,
  },
});

export default CartScreen;
