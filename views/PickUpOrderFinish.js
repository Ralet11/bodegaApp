import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  SafeAreaView,
  BackHandler,
  Platform,
} from 'react-native';
import { FontAwesome5, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react-native';
import { API_URL } from '@env';
import { updateOrderIn, setCurrentOrder } from '../redux/slices/orders.slice';

const OrderSummary = () => {
  const order = useSelector((state) => state.orders.currentOrder);
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [shopData, setShopData] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const styles = lightStyles;

  console.log(order, "order");

  // Load shop data
  useEffect(() => {
    const fetchShopData = async () => {
      if (!order?.local_id) return;
      try {
        const response = await fetch(`${API_URL}/api/local/get/${order.local_id}`);
        const data = await response.json();
        setShopData(data);
      } catch (error) {
        console.error('Error fetching shop data:', error);
      }
    };
    fetchShopData();
  }, [order]);

  // Disable back button
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Main');
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  const formatPrice = (price) => {
    if (typeof price === 'number') return price.toFixed(2);
    if (!isNaN(parseFloat(price))) return parseFloat(price).toFixed(2);
    return '0.00';
  };

  const calculateSubtotal = () => {
    return order.order_details.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateDifference = () => {
    const subtotal = calculateSubtotal();
    const total = parseFloat(order.total_price) || 0;
    return (total - subtotal).toFixed(2);
  };

  const calculateTotalSavings = () => {
    return order.order_details.reduce((acc, item) => {
      if (item.finalPrice && item.finalPrice < item.price) {
        const saving = (parseFloat(item.price) - parseFloat(item.finalPrice)) * item.quantity;
        return acc + saving;
      }
      return acc;
    }, 0).toFixed(2);
  };

  const openAddressInMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Open in Maps',
        'Would you like to open in Google Maps or Apple Maps?',
        [
          { text: 'Google Maps', onPress: () => Linking.openURL(googleMapsUrl) },
          { text: 'Apple Maps', onPress: () => Linking.openURL(appleMapsUrl) },
        ]
      );
    } else {
      Linking.openURL(googleMapsUrl);
    }
  };

  const getTodayOpeningHours = () => {
    if (!shopData || !shopData.openingHours) return 'Closed today';
    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date().getDay();
    const todayString = daysOfWeek[today];
    const todayHours = shopData.openingHours.find((h) => h.day === todayString);
    if (todayHours) {
      return `Open from ${todayHours.open_hour.slice(0, 5)} to ${todayHours.close_hour.slice(0, 5)}`;
    }
    return 'Closed today';
  };

  const renderOrderDetails = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemQuantity}>{item.quantity}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      </View>
      <Text style={styles.itemFinalPrice}>${formatPrice(item.price)}</Text>
    </View>
  );

  const getOrderStatusInfo = (order) => {
    const { status } = order;
    let mainText = '';
    let icon = null;
    let color = '';

    switch (status) {
      case 'new order':
        mainText = 'Order placed';
        icon = <Clock color="#3498db" size={24} />;
        color = '#3498db';
        break;
      case 'accepted':
        mainText = 'Order accepted';
        icon = <CheckCircle color="#2ecc71" size={24} />;
        color = '#2ecc71';
        break;
      case 'sending':
        mainText = 'Order is ready for pickup';
        icon = <Package color="#e67e22" size={24} />;
        color = '#e67e22';
        break;
      case 'rejected':
        mainText = 'Order rejected';
        icon = <XCircle color="#e74c3c" size={24} />;
        color = '#e74c3c';
        break;
      case 'finished':
        mainText = 'Order completed';
        icon = <CheckCircle color="#27ae60" size={24} />;
        color = '#27ae60';
        break;
      default:
        mainText = 'Unknown status';
        icon = <Clock color="#95a5a6" size={24} />;
        color = '#95a5a6';
    }
    return { mainText, icon, color };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#ff9900', '#FFFFFF']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Ionicons name="arrow-back" size={24} color={styles.iconColor.color} />
              </TouchableOpacity>
              <Text style={styles.status}>{order.status}</Text>
            </View>

            {order.type === 'Order-in' ? (
              <View style={styles.yellowBackground}>
                <Text style={styles.instruction}>Show this code to receive your order</Text>
                <View style={styles.codeContainer}>
                  {order.code.split('').map((digit, index) => (
                    <View key={index} style={styles.codeDigit}>
                      <Text style={styles.codeText}>{digit}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.yellowBackground}>
                <Text style={styles.instruction}>
                  Please present your name and order number to receive your order
                </Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>Order Number: {order.id}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.storeInfo}
              onPress={() => openAddressInMaps(shopData?.address)}
            >
              <Image
                source={{
                  uri:
                    shopData?.logo ||
                    'https://res.cloudinary.com/doqyrz0sg/image/upload/v1723576023/product/qlqgmmfijktkn17oqinu.jpg',
                }}
                style={styles.storeIcon}
              />
              <View style={styles.storeDetails}>
                <Text style={styles.storeName}>{shopData?.name}</Text>
                <Text style={styles.storeAddress}>{shopData?.address}</Text>
                <Text style={styles.storeDistance}>2.5 KM</Text>
              </View>
              <FontAwesome name="arrow-right" size={20} color={styles.iconColor.color} />
            </TouchableOpacity>

            {order.type === 'Order-in' && (
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>{getTodayOpeningHours()}</Text>
                <Text style={styles.deliverySubtitle}>
                  Only the account holder can receive the order during this time slot.
                </Text>
              </View>
            )}
            {order.type === 'Pick-up' && (
              <View style={styles.statusInfo}>
                <View style={styles.statusHeader}>
                  {getOrderStatusInfo(order).icon}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getOrderStatusInfo(order).color },
                    ]}
                  >
                    {getOrderStatusInfo(order).mainText}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <FlatList
                data={order.order_details}
                renderItem={renderOrderDetails}
                keyExtractor={(item) => item.id.toString()}
                style={styles.orderDetailsList}
                scrollEnabled
              />
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Additional Charges</Text>
                <Text style={styles.totalPrice}>${calculateDifference()}</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>
                  ${formatPrice(order.total_price)}
                </Text>
              </View>
              <View style={styles.discountContainer}>
                <FontAwesome5 name="tags" size={16} color="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.discountText}>You saved with Bodega+</Text>
                <Text style={styles.discountAmount}>${calculateTotalSavings()}</Text>
              </View>
            </View>

            <View style={Platform.OS === 'ios' ? { marginTop: 20 } : {}}>
              <Text style={styles.transactionId}>Transaction ID: {order.pi}</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
      {/* No rating or socket here */}
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  gradient: { flex: 1 },
  scrollContainer: {},
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    shadowColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  yellowBackground: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#FFEFCF',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    color: '#888888',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  codeDigit: {
    borderColor: '#ffcc00',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E6E6E6',
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
  },
  storeDetails: {
    marginLeft: 10,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  storeAddress: {
    fontSize: 14,
    color: '#888888',
  },
  storeDistance: {
    fontSize: 12,
    color: '#888888',
  },
  deliveryInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  deliverySubtitle: {
    fontSize: 12,
    color: '#888888',
  },
  statusInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summary: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  orderDetailsList: {
    maxHeight: 250,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
    paddingVertical: 5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
    color: '#333333',
  },
  itemDetails: { flexDirection: 'column' },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemFinalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#333333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 10,
    borderColor: '#E6E6E6',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  discountText: {
    fontSize: 14,
    marginLeft: 5,
    color: '#FF5722',
  },
  discountAmount: {
    fontSize: 14,
    marginLeft: 'auto',
    color: '#FF5722',
  },
  transactionId: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    color: '#888888',
  },
  iconColor: {
    color: '#000000',
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
});

export default OrderSummary;
