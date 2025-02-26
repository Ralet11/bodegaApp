import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  ActivityIndicator,
  Animated,
  StyleSheet,
  BackHandler
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Axios from 'react-native-axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setCurrentOrder } from '../redux/slices/orders.slice';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { setAuxShops } from '../redux/slices/setUp.slice';

import CancelConfirmationModal from '../components/modals/CancelConfirmationModal';
import OrderCanceledModal from '../components/modals/OrderCanceledModal';
import RatingModal from '../components/modals/RatingModal';
import OrderDetailsModal from '../components/modals/OrderDetailsModal';

const { width, height } = Dimensions.get('window');

const AcceptedOrder = () => {
  const colorScheme = useColorScheme();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isCancelConfirmationVisible, setIsCancelConfirmationVisible] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);

  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const shops = useSelector((state) => state?.setUp?.shops);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const order = useSelector((state) => state.orders.currentOrder);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';
  const progressAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  // Animación de la barra
  useEffect(() => {
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    ).start();
  }, [order]);

  // Cálculo de ruta
  useEffect(() => {
    if (!address || !shops) return;
    const currentShopDetails = findCurrentShop();
    if (!currentShopDetails) {
      setIsLoading(false);
      return;
    }
    const destination = currentShopDetails.address;
    fetchRoute(address, destination);
  }, [address, shops]);

  async function fetchRoute(originAddress, destinationAddress) {
    try {
      const response = await Axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          originAddress
        )}&destination=${encodeURIComponent(destinationAddress)}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.routes.length) {
        const points = decode(response.data.routes[0].overview_polyline.points);
        const routeCoords = points.map(point => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoords);

        const { distance, duration } = response.data.routes[0].legs[0];
        setDistance(distance.text);
        setDuration(duration.text);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  function findCurrentShop() {
    for (const catId in shops) {
      const s = shops[catId].find(shop => shop.id === currentShop);
      if (s) return s;
    }
    return null;
  }

  function decode(t) {
    let points = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;
      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  }

  function getOrderStatusText() {
    let mainText = '';
    let subText = '';
    switch (order?.status) {
      case 'new order':
        mainText = 'Order placed';
        subText = 'The store will accept your order soon.';
        break;
      case 'accepted':
        mainText = 'Order accepted';
        subText = 'The store is working on your order.';
        break;
      case 'sending':
        if (order?.type === 'Pick-up') {
          mainText = 'Sending your order';
          subText = 'Your order is ready to pick up';
        } else if (order?.type === 'Order-In') {
          mainText = 'Sending your order';
          subText = 'Approach the store to claim your order';
        }
        break;
      case 'rejected':
        mainText = 'Order rejected';
        subText = 'Your order has been canceled by the store.';
        break;
      case 'finished':
        mainText = 'Order delivered';
        subText = 'Please confirm the receipt of your order.';
        break;
      default:
        mainText = '';
        subText = '';
    }
    return { mainText, subText };
  }

  const { mainText, subText } = getOrderStatusText();

  function handleViewOrderDetails(orderDetails) {
    setSelectedOrderDetails(orderDetails);
    setShowOrderDetailsModal(true);
  }

  async function handleCancelOrder() {
    try {
      const response = await Axios.post(`${API_URL}/api/orders/cancelOrder/${order.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        dispatch(setCurrentOrder({ ...order, status: 'rejected' }));
        setIsModalVisible(true);
        setModalMessage('Your order has been canceled. Please contact support if needed.');
      }
    } catch (error) {
      console.log(error);
      setModalMessage('Error canceling the order. Please contact support.');
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer
      ]}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFEB3B" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: routeCoordinates.length > 0 ? routeCoordinates[0].latitude : -27.4695,
            longitude: routeCoordinates.length > 0 ? routeCoordinates[0].longitude : -58.8306,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {routeCoordinates.length > 0 && (
            <>
              <Marker coordinate={routeCoordinates[0]} title="User Location" />
              <Marker
                coordinate={routeCoordinates[routeCoordinates.length - 1]}
                title="Shop Location"
              />
              <Polyline coordinates={routeCoordinates} strokeColor="#000" strokeWidth={3} />
            </>
          )}
        </MapView>
      )}

      <View
        style={[
          styles.infoContainer,
          colorScheme === 'dark' ? styles.darkInfoContainer : styles.lightInfoContainer
        ]}
      >
        <View style={styles.orderInfo}>
          <Text
            style={[
              styles.orderType,
              colorScheme === 'dark' ? styles.darkText : styles.lightText
            ]}
          >
            {order?.type}
          </Text>
          {order?.type === 'Order-in' ? (
            <>
              <Text
                style={[
                  styles.orderNumber,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                Order #{order?.id}
              </Text>
              <Text
                style={[
                  styles.orderMessage,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                Approach the store to claim your order
              </Text>
            </>
          ) : order?.type !== 'Delivery' ? (
            <>
              <Text
                style={[
                  styles.orderNumber,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                Order #{order?.id}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.orderStatus,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                {mainText}
              </Text>
              <Text
                style={[
                  styles.orderMessage,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                {subText}
              </Text>
              <Text
                style={[
                  styles.orderCodeLabel,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                You can pick up with this code:
              </Text>
              <Text
                style={[
                  styles.orderCode,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                {order?.code}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.orderNumber,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                Order #{order?.id}
              </Text>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.orderStatus,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                {mainText}
              </Text>
              <Text
                style={[
                  styles.orderMessage,
                  colorScheme === 'dark' ? styles.darkText : styles.lightText
                ]}
              >
                {subText}
              </Text>
            </>
          )}
          {order.status === 'new order' && (
            <TouchableOpacity onPress={() => setIsCancelConfirmationVisible(true)}>
              <Text style={styles.smallButtonText1}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <FontAwesome name="road" size={16} color="#FFEB3B" />
            <Text
              style={[
                styles.orderDetailText,
                colorScheme === 'dark' ? styles.darkText : styles.lightText
              ]}
            >
              {distance}
            </Text>
          </View>
          <View style={styles.orderDetail}>
            <FontAwesome name="clock-o" size={16} color="#FFEB3B" />
            <Text
              style={[
                styles.orderDetailText,
                colorScheme === 'dark' ? styles.darkText : styles.lightText
              ]}
            >
              {duration}
            </Text>
          </View>
        </View>

        <View style={styles.smallButtonContainer}>
          <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.smallButtonText}>BACK TO HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => handleViewOrderDetails(order.order_details)}
          >
            <Text style={styles.smallButtonText}>VIEW ORDER DETAILS</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CancelConfirmationModal
        visible={isCancelConfirmationVisible}
        onClose={() => setIsCancelConfirmationVisible(false)}
        onConfirm={handleCancelOrder}
      />

      <OrderCanceledModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        modalMessage={modalMessage}
      />

      {/* Por ahora no usamos RatingModal, lo dejamos inactivo */}
      <RatingModal
        visible={false}
        onClose={() => {}}
        onRate={() => {}}
      />

      <OrderDetailsModal
        visible={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        orderDetails={selectedOrderDetails}
        order={order}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: { flex: 1 },
  infoContainer: {
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    marginTop: -20,
  },
  darkInfoContainer: { backgroundColor: '#1c1c1c' },
  lightInfoContainer: { backgroundColor: '#fff' },
  orderInfo: {
    marginBottom: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 15,
  },
  orderType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9900',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  orderStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  orderMessage: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  orderCode: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#ff9900',
  },
  orderCodeLabel: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  darkText: { color: '#fff' },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  orderDetail: { alignItems: 'center' },
  orderDetailText: {
    fontSize: 14,
    marginTop: 5,
  },
  smallButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  smallButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  smallButtonText1: {
    paddingTop: 20,
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  smallButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  progressBarContainer: {
    height: 10,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#ff9900',
    borderRadius: 5,
  },
});

export default AcceptedOrder;
