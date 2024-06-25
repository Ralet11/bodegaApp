import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, ActivityIndicator, Animated, Modal, FlatList } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import Axios from 'react-native-axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import socketIOClient from "socket.io-client";
import { emptyCart, setCurrentOrder, setOrderIn, updateOrderIn } from '../redux/slices/orders.slice';
import { API_URL } from '@env';
import { AirbnbRating } from 'react-native-ratings';
import { setUser } from '../redux/slices/user.slice';
import { setAuxShops } from '../redux/slices/setUp.slice';

const { width, height } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

const AcceptedOrder = () => {
  const colorScheme = useColorScheme();
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);
  const [balanceAdded, setBalanceAdded] = useState(false);
  const [balanceError, setBalanceError] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [rating, setRating] = useState(0);
  const [buttonsVisible, setButtonsVisible] = useState(true);

  const address = useSelector((state) => state?.user?.address) || '';
  const user = useSelector((state) => state.user.userInfo.data);
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const navigation = useNavigation();
  const shops = useSelector((state) => state?.setUp?.shops);
  const currentShop = useSelector((state) => state.currentShop.currentShop);
  const order = useSelector((state) => state.orders.currentOrder);
  const dispatch = useDispatch();

  const orderRef = useRef(order);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const socket = socketIOClient(`${API_URL}`);
    console.log("cambio en order")
    const fetchOrder = async (orderId) => {
      console.log("fetchOrder")
      try {
        const response = await Axios.get(`${API_URL}/api/orders/getByOrderId/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const updatedOrder = response.data;
        dispatch(setCurrentOrder(updatedOrder));
        dispatch(updateOrderIn({ orderId: updatedOrder.id, status: updatedOrder.status }));

        if (updatedOrder.status === 'rejected') {
          setIsModalVisible(true);
          setModalMessage('Your order has been canceled by the store. You will receive a refund within 48 hours or the balance will be credited to your Bodega Balance immediately.');
        } else if (updatedOrder.status === 'finished') {
          setShowRatingModal(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const handleOrderStateChange = (data) => {
      const { orderId } = data;
      console.log(orderId, "orden")

      if (orderId == orderRef.current.id) {
        console.log(orderId, orderRef.current.id, "order info");
        fetchOrder(orderId);
      }
    };

    socket.on('changeOrderState', handleOrderStateChange);

    return () => {
      socket.off('changeOrderState');
      socket.disconnect();
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (order.status === 'finished') {
      setShowRatingModal(true);
    } else if (order.status === 'rejected') {
      setIsModalVisible(true);
      setModalMessage('Your order has been canceled by the store. You will receive a refund within 48 hours or the balance will be credited to your Bodega Balance immediately.');
    }
  }, [order]);

  const handleBackPress = () => {
    navigation.navigate('Home');
    return true;
  };

  console.log(order.id, "order")

  const handleRefund = async () => {
    setButtonsVisible(false);
    const data = {
      pi: order.pi,
      amount: Math.round(parseFloat(order.total_price) * 100), // Convert to cents
    }
    try {
      const response = await Axios.post(`${API_URL}/api/payment/refoundOrder`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setModalMessage('Refund successful. You will receive your money back within 48 hours.');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 3000);
    } catch (error) {
      console.log(error);
      setModalMessage('Error processing refund. Please contact support.');
    }
  };

  const handleBalance = async () => {
    setIsProcessingBalance(true);
    setBalanceError(false);
    setButtonsVisible(false);
    try {
      const price = Number(order.total_price);
      const response = await Axios.put(`${API_URL}/api/users/addUserBalance`, { price }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const info = {
        data: {
          client: response.data,
          token,
        },
      };
      dispatch(setUser(info));
      setBalanceAdded(true);
      setIsProcessingBalance(false);
      setModalMessage('The balance has been added to your Bodega Balance.');
      setTimeout(() => {
        navigation.navigate('Home');
      }, 3000);
    } catch (error) {
      console.log(error);
      setBalanceError(true);
      setIsProcessingBalance(false);
      setModalMessage('Error processing balance. Please contact support.');
    }
  };

  const handleRating = async () => {
    try {
       await Axios.post(`${API_URL}/api/local/rating`, {
        id: currentShop,
        rating,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowRatingModal(false);
      dispatch(setAuxShops())
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

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
  const destination = currentShopDetails ? currentShopDetails.address : null;

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await Axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(address)}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`);

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
    };
    if (address && destination) {
      fetchRoute();
    }
  }, [address, destination]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: getOrderStatusText().progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [order]);

  const decode = (t, e) => {
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
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
  };

  const getOrderStatusText = () => {
    switch (order?.status) {
      case 'new order':
        return {
          mainText: 'Order placed',
          subText: 'The store will accept your order soon.',
          progress: 0.3,
        };
      case 'accepted':
        return {
          mainText: 'Order accepted',
          subText: 'The store is working on your order.',
          progress: 0.6,
        };
      case 'sending':
        return {
          mainText: 'Sending your order',
          subText: 'The store is handling the delivery directly.',
          progress: 1,
        };
      case 'rejected':
        return {
          mainText: 'Order rejected',
          subText: 'Your order has been canceled by the store.',
          progress: 0,
        };
      case 'finished':
        return {
          mainText: 'Order delivered',
          subText: 'Please confirm the receipt of your order.',
          progress: 1,
        };
      default:
        return {
          mainText: '',
          subText: '',
          progress: 0,
        };
    }
  };

  const { mainText, subText, progress } = getOrderStatusText();

  return (
    <SafeAreaView style={[styles.container, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
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
              <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]} title="Shop Location" />
              <Polyline coordinates={routeCoordinates} strokeColor="#000" strokeWidth={3} />
            </>
          )}
        </MapView>
      )}
      <View style={[styles.infoContainer, colorScheme === 'dark' ? styles.darkInfoContainer : styles.lightInfoContainer]}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order #{order?.id}</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) }]} />
          </View>
          <Text style={[styles.orderStatus, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{mainText}</Text>
          <Text style={[styles.orderMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{subText}</Text>
        </View>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetail}>
            <FontAwesome name="road" size={16} color="#FFEB3B" />
            <Text style={[styles.orderDetailText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{distance}</Text>
          </View>
          <View style={styles.orderDetail}>
            <FontAwesome name="clock-o" size={16} color="#FFEB3B" />
            <Text style={[styles.orderDetailText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{duration}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.buttonText}>BACK TO HOME</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, colorScheme === 'dark' ? styles.darkModalContent : styles.lightModalContent]}>
            <Text style={[styles.modalTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order Canceled</Text>
            <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
              {modalMessage}
            </Text>
            <View style={styles.modalButtons}>
              {isProcessingBalance ? (
                <View style={styles.centeredLoader}>
                  <ActivityIndicator size="large" color="#FFEB3B" />
                </View>
              ) : balanceAdded ? (
                <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                  
                </Text>
              ) : balanceError ? (
                <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                  An error occurred while adding the balance to your account. Please contact support.
                </Text>
              ) : (
                <>
                  {buttonsVisible && order.pi !== 'bodegaBalance' && (
                    <TouchableOpacity style={styles.modalButton} onPress={handleRefund}>
                    <Text style={styles.modalButtonText}>Refund</Text>
                  </TouchableOpacity>
                  )}
                  {buttonsVisible && (
                    <TouchableOpacity style={styles.modalButton} onPress={handleBalance}>
                    <Text style={styles.modalButtonText}>Credit to Bodega Balance</Text>
                  </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={() => {
          setShowRatingModal(!showRatingModal);
        }}
      >
        <View style={styles.modalContainer}>
          <FlatList
            data={[{}]}
            renderItem={() => (
              <View style={[styles.modalContent, colorScheme === 'dark' ? styles.darkModalContent : styles.lightModalContent]}>
                <Text style={[styles.modalTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order Delivered</Text>
                {showStars ? (
                  <>
                    <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      Rate this shop
                    </Text>
                    <AirbnbRating
                      count={5}
                      defaultRating={0}
                      size={20}
                      onFinishRating={(rating) => setRating(rating)}
                    />
                    <TouchableOpacity style={styles.modalButton} onPress={handleRating}>
                      <Text style={styles.modalButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                      The store has marked your order as delivered. Did you receive your order correctly?
                    </Text>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={styles.modalButton} onPress={() => setShowStars(true)}>
                        <Text style={styles.modalButtonText}>Yes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.modalButton} onPress={handleRefund}>
                        <Text style={styles.modalButtonText}>Contact Support</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  lightInfoContainer: {
    backgroundColor: '#fff',
  },
  darkInfoContainer: {
    backgroundColor: '#1c1c1c',
  },
  orderInfo: {
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  orderMessage: {
    fontSize: 14,
    marginTop: 5,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderDetail: {
    alignItems: 'center',
  },
  orderDetailText: {
    fontSize: 14,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#dc3545',
  },
  backButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ff9900',
    borderRadius: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '95%',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  lightModalContent: {
    backgroundColor: '#fff',
  },
  darkModalContent: {
    backgroundColor: '#1c1c1c',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 10,
    backgroundColor: '#ff9900',
    alignItems: 'center',
    marginTop: 50
  },
  modalButtonText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000',
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default AcceptedOrder;