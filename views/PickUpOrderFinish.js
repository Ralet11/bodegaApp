import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  TextInput,
  useColorScheme,
  StyleSheet,
  BackHandler, // Import BackHandler
} from 'react-native';
import { FontAwesome5, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import socketIOClient from 'socket.io-client';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { updateOrderIn, setCurrentOrder } from '../redux/slices/orders.slice';

const OrderSummary = () => {
  const order = useSelector((state) => state.orders.currentOrder);
  const token = useSelector((state) => state.user.userInfo.data.token);
  const [shopData, setShopData] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
  const orderRef = useRef(order);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    const fetchShopData = async () => {
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

  useEffect(() => {
    const socket = socketIOClient(`${API_URL}`);

    const fetchOrder = async (orderId) => {
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
          setShowRatingModal(true);
          setModalMessage('Your order has been canceled by the store. You will receive a refund within 48 hours, or the balance will be credited to your account immediately.');
        } else if (updatedOrder.status === 'finished') {
          setShowRatingModal(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const handleOrderStateChange = (data) => {
      const { orderId } = data;
      if (orderId === orderRef.current.id) {
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
    }
  }, [order]);

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('Main');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return price.toFixed(2);
    } else if (!isNaN(parseFloat(price))) {
      return parseFloat(price).toFixed(2);
    }
    return '0.00';
  };

  const calculateSubtotal = () => {
    return order.order_details.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const calculateDifference = () => {
    const subtotal = calculateSubtotal();
    const total = order.total_price;
    return (total - subtotal).toFixed(2);
  };

  const calculateTotalSavings = () => {
    return order.order_details.reduce((totalSavings, item) => {
      if (item.discount || item.promotion) {
        const savings = (parseFloat(item.originalPrice) - parseFloat(item.price)) * item.quantity;
        return totalSavings + savings;
      }
      return totalSavings;
    }, 0).toFixed(2);
  };

  const openAddressInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log('Cannot open the link:', url);
        }
      })
      .catch((err) => console.error('Error opening the link:', err));
  };

  const getTodayOpeningHours = () => {
    if (!shopData || !shopData.openingHours) return 'Closed today';

    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date().getDay();
    const todayString = daysOfWeek[today];

    const todayHours = shopData.openingHours.find((hours) => hours.day === todayString);

    if (todayHours) {
      return `Open from ${todayHours.open_hour.slice(0, 5)} to ${todayHours.close_hour.slice(0, 5)}`;
    } else {
      return 'Closed today';
    }
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

  const submitRating = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          local_id: order.local_id,
          rating,
          message: comment,
          order_id: order.id,
        }),
      });

      if (response.ok) {
        setIsReviewSubmitted(true);
      } else {
        console.error('Error submitting the rating');
      }
    } catch (error) {
      console.error('Error submitting the rating:', error);
    }
  };

  const handleSupport = () => {
    Linking.openURL('https://your-support-link.com');
  };

  const handleClose = () => {
    setShowRatingModal(false);
    navigation.navigate('Main');
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#333333', '#1E1E1E'] : ['#ff9900', '#FFFFFF']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                <Ionicons name="arrow-back" size={24} color={styles.iconColor.color} />
              </TouchableOpacity>
              <Text style={styles.status}>Pending Order</Text>
            </View>

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

            <TouchableOpacity
              style={styles.storeInfo}
              onPress={() => openAddressInGoogleMaps(shopData?.address)}
            >
              <Image
                source={{
                  uri: shopData?.logo || 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1723576023/product/qlqgmmfijktkn17oqinu.jpg',
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

            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryTitle}>{getTodayOpeningHours()}</Text>
              <Text style={styles.deliverySubtitle}>
                Only the account holder can receive the order during this time slot.
              </Text>
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <FlatList
                data={order.order_details}
                renderItem={renderOrderDetails}
                keyExtractor={(item) => item.id.toString()}
                style={styles.orderDetailsList}
                contentContainerStyle={styles.orderDetailsContent}
                scrollEnabled={true}
              />

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Additional Charges</Text>
                <Text style={styles.totalPrice}>${calculateDifference()}</Text>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>${formatPrice(order.total_price)}</Text>
              </View>

              <View style={styles.discountContainer}>
                <FontAwesome5 name="tags" size={16} color="#FFD700" style={{ marginRight: 8 }} />
                <Text style={styles.discountText}>You saved with Bodega+</Text>
                <Text style={styles.discountAmount}>${calculateTotalSavings()}</Text>
              </View>
            </View>

            <Text style={styles.transactionId}>Transaction ID: {order.pi}</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isReviewSubmitted ? 'Thank you for your rating!' : 'Your order has been marked as delivered'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isReviewSubmitted ? 'Your rating has been submitted successfully.' : 'You can leave a review'}
            </Text>

            {!isReviewSubmitted && (
              <>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <FontAwesome
                        name="star"
                        size={32}
                        color={star <= rating ? '#FFD700' : '#E0E0E0'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Leave a comment (optional)"
                  placeholderTextColor={colorScheme === 'dark' ? '#888888' : '#CCCCCC'}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />

                <TouchableOpacity style={styles.submitButton} onPress={submitRating}>
                  <Text style={styles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </>
            )}

            {isReviewSubmitted && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
              <Text style={styles.supportButtonText}>Something wrong? Contact support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const commonStyles = {
  screen: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    margin: 10,
    width: '90%',
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
  },
  yellowBackground: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
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
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storeDetails: {
    marginLeft: 10,
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  storeAddress: {
    fontSize: 14,
  },
  storeDistance: {
    fontSize: 12,
  },
  deliveryInfo: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deliverySubtitle: {
    fontSize: 12,
  },
  summary: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  },
  itemDetails: {
    flexDirection: 'column',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemFinalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  discountAmount: {
    fontSize: 14,
    marginLeft: 'auto',
  },
  transactionId: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentInput: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    marginTop: 10,
  },
  supportButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  closeButton: {
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
  },
  iconColor: {
    color: '#000',
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
  },
  status: {
    ...commonStyles.status,
    color: '#333333',
  },
  yellowBackground: {
    ...commonStyles.yellowBackground,
    backgroundColor: '#FFEFCF',
  },
  instruction: {
    ...commonStyles.instruction,
    color: '#888888',
  },
  codeDigit: {
    ...commonStyles.codeDigit,
    backgroundColor: '#FFFFFF',
  },
  codeText: {
    ...commonStyles.codeText,
    color: '#333333',
  },
  storeInfo: {
    ...commonStyles.storeInfo,
    borderColor: '#E6E6E6',
  },
  storeIcon: {
    ...commonStyles.storeIcon,
    backgroundColor: '#F6F6F6',
  },
  storeName: {
    ...commonStyles.storeName,
    color: '#000000',
  },
  storeAddress: {
    ...commonStyles.storeAddress,
    color: '#888888',
  },
  storeDistance: {
    ...commonStyles.storeDistance,
    color: '#888888',
  },
  deliveryInfo: {
    ...commonStyles.deliveryInfo,
    backgroundColor: '#FFF8E1',
  },
  deliveryTitle: {
    ...commonStyles.deliveryTitle,
    color: '#333333',
  },
  deliverySubtitle: {
    ...commonStyles.deliverySubtitle,
    color: '#888888',
  },
  itemQuantity: {
    ...commonStyles.itemQuantity,
    color: '#333333',
  },
  itemName: {
    ...commonStyles.itemName,
    color: '#333333',
  },
  itemFinalPrice: {
    ...commonStyles.itemFinalPrice,
    color: '#333333',
  },
  totalLabel: {
    ...commonStyles.totalLabel,
    color: '#333333',
  },
  totalPrice: {
    ...commonStyles.totalPrice,
    color: '#333333',
  },
  discountText: {
    ...commonStyles.discountText,
    color: '#FF5722',
  },
  discountAmount: {
    ...commonStyles.discountAmount,
    color: '#FF5722',
  },
  transactionId: {
    ...commonStyles.transactionId,
    color: '#888888',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    ...commonStyles.modalContent,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#333333',
  },
  modalSubtitle: {
    ...commonStyles.modalSubtitle,
    color: '#666666',
  },
  commentInput: {
    ...commonStyles.commentInput,
    borderColor: '#DDDDDD',
    color: '#000000',
  },
  submitButton: {
    ...commonStyles.submitButton,
    backgroundColor: '#FF9900',
  },
  submitButtonText: {
    ...commonStyles.submitButtonText,
    color: '#FFFFFF',
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#333333',
  },
  supportButtonText: {
    ...commonStyles.supportButtonText,
    color: '#007BFF',
  },
  iconColor: {
    color: '#000000',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
  },
  status: {
    ...commonStyles.status,
    color: '#FFFFFF',
  },
  yellowBackground: {
    ...commonStyles.yellowBackground,
    backgroundColor: '#333333',
  },
  instruction: {
    ...commonStyles.instruction,
    color: '#CCCCCC',
  },
  codeDigit: {
    ...commonStyles.codeDigit,
    backgroundColor: '#2A2A2A',
  },
  codeText: {
    ...commonStyles.codeText,
    color: '#FFFFFF',
  },
  storeInfo: {
    ...commonStyles.storeInfo,
    borderColor: '#333333',
  },
  storeIcon: {
    ...commonStyles.storeIcon,
    backgroundColor: '#2A2A2A',
  },
  storeName: {
    ...commonStyles.storeName,
    color: '#FFFFFF',
  },
  storeAddress: {
    ...commonStyles.storeAddress,
    color: '#CCCCCC',
  },
  storeDistance: {
    ...commonStyles.storeDistance,
    color: '#CCCCCC',
  },
  deliveryInfo: {
    ...commonStyles.deliveryInfo,
    backgroundColor: '#2A2A2A',
  },
  deliveryTitle: {
    ...commonStyles.deliveryTitle,
    color: '#FFFFFF',
  },
  deliverySubtitle: {
    ...commonStyles.deliverySubtitle,
    color: '#CCCCCC',
  },
  itemQuantity: {
    ...commonStyles.itemQuantity,
    color: '#FFFFFF',
  },
  itemName: {
    ...commonStyles.itemName,
    color: '#FFFFFF',
  },
  itemFinalPrice: {
    ...commonStyles.itemFinalPrice,
    color: '#FFFFFF',
  },
  totalLabel: {
    ...commonStyles.totalLabel,
    color: '#FFFFFF',
  },
  totalPrice: {
    ...commonStyles.totalPrice,
    color: '#FFFFFF',
  },
  discountText: {
    ...commonStyles.discountText,
    color: '#FFA726',
  },
  discountAmount: {
    ...commonStyles.discountAmount,
    color: '#FFA726',
  },
  transactionId: {
    ...commonStyles.transactionId,
    color: '#CCCCCC',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    ...commonStyles.modalContent,
    backgroundColor: '#1E1E1E',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#FFFFFF',
  },
  modalSubtitle: {
    ...commonStyles.modalSubtitle,
    color: '#CCCCCC',
  },
  commentInput: {
    ...commonStyles.commentInput,
    borderColor: '#444444',
    color: '#FFFFFF',
  },
  submitButton: {
    ...commonStyles.submitButton,
    backgroundColor: '#FFC107',
  },
  submitButtonText: {
    ...commonStyles.submitButtonText,
    color: '#000000',
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#FFFFFF',
  },
  supportButtonText: {
    ...commonStyles.supportButtonText,
    color: '#FF9800',
  },
  iconColor: {
    color: '#FFFFFF',
  },
  summaryTitle: {
   ...commonStyles.summaryTitle,
   color:"#FFF"
  }
});

export default OrderSummary;
