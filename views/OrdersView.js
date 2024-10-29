import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../redux/slices/orders.slice';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import OrderSkeletonLoader from '../components/SkeletonOrder';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import OrderStatus from '../components/OrderStatus';
import { setOrderAux } from '../redux/slices/setUp.slice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const OrderScreen = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.user?.userInfo);
  const orderAux = useSelector((state) => state?.setUp?.orderAux);
  const navigation = useNavigation();

  const user = userInfo?.data?.client || null;
  const token = userInfo?.data?.token || null;

  const [orders, setOrders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReview, setCurrentReview] = useState({ rating: 0, message: '' });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLocalId, setReviewLocalId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOrderType, setSelectedOrderType] = useState('');
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [finishedProcessed, setFinishedProcessed] = useState(false);

  const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const totalUserSavings = user ? roundToTwo(Number(user.savings || 0)) : 0;

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && token) {
        try {
          const response = await Axios.get(`${API_URL}/api/orders/getByUser/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setOrders(response.data);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      } else {
        setOrders([]);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [orderAux, user, token]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (user && token) {
        try {
          const response = await Axios.get(`${API_URL}/api/reviews/getByUser/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReviews(response.data);
        } catch (error) {
          console.log(error);
        }
      } else {
        setReviews([]);
      }
    };

    if (user && token && user.role !== 'guest') {
      dispatch(getAllOrders(user.id, token));
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [dispatch, user, token]);

  const formatDateTime = (dateString) => {
    const date = dayjs(dateString);
    return `${date.format('MM-DD-YY')} ${date.format('HH:mm')}`;
  };

  const handleViewDetails = (orderDetails) => {
    setSelectedOrderDetails(orderDetails);
    setModalVisible(true);
  };

  const refreshOrders = () => {
    if (user && token && user.role !== 'guest') {
      dispatch(getAllOrders(user.id, token));
    } else {
      setOrders([]);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [finishedProcessed]);

  const calculateTotalSavings = (orderDetails) => {
    const totalSavings = orderDetails.reduce((total, item) => {
      let originalPrice = parseFloat(item.originalPrice || 0);
      const currentPrice = parseFloat(item.currentPrice || 0);
      const quantity = item.quantity || 1;

      if (item.selectedExtras && typeof item.selectedExtras === 'object') {
        Object.values(item.selectedExtras).forEach((extrasArray) => {
          if (Array.isArray(extrasArray)) {
            extrasArray.forEach((extra) => {
              originalPrice += parseFloat(extra.price || 0);
            });
          }
        });
      }

      const savingsPerItem = (originalPrice - currentPrice) * quantity;
      return total + savingsPerItem;
    }, 0);

    return totalSavings;
  };

  const navigateShopWithProducts = async (orderDetails, shopId, orderType) => {
    try {
      const response = await Axios.get(`${API_URL}/api/local/get/${shopId}`);
      const shop = response.data;
      navigation.navigate('Shop', { shop, orderDetails, orderType });
    } catch (error) {
      console.log(error);
    }
  };

  const handleReviewPress = (localId) => {
    const existingReview = reviews.find((review) => review.local_id === localId);
    setReviewLocalId(localId);
    if (existingReview) {
      setSelectedReview(existingReview);
      setCurrentReview(existingReview);
      setIsEditingReview(true);
    } else {
      setSelectedReview(null);
      setCurrentReview({ rating: 0, message: '' });
      setIsEditingReview(false);
    }
    setShowReviewModal(true);
  };

  const handleDeleteReview = async () => {
    try {
      if (selectedReview && token) {
        await Axios.delete(`${API_URL}/api/reviews/delete/${selectedReview.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(reviews.filter((review) => review.id !== selectedReview.id));
        setShowReviewModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.ratingContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentReview({ ...currentReview, rating: index + 1 })}
          >
            <FontAwesome
              name={index < currentReview.rating ? 'star' : 'star-o'}
              size={30}
              color="#FFD700"
              style={{ marginHorizontal: 5 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmitReview = async () => {
    try {
      if (user && token) {
        await Axios.post(
          `${API_URL}/api/reviews/create`,
          {
            local_id: reviewLocalId,
            user_id: user.id,
            rating: currentReview.rating,
            message: currentReview.message,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await fetchOrdersAndReviews();
        setShowReviewModal(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrdersAndReviews = async () => {
    try {
      if (user && token && user.role !== 'guest') {
        await dispatch(getAllOrders(user.id, token));
        const reviewsResponse = await Axios.get(`${API_URL}/api/reviews/getByUser/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(reviewsResponse.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrdersAndReviews();
  }, [dispatch, user, token]);

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedOrderType('');
  };

  const showDatePicker = () => {
    setShowDatePickerModal(true);
  };

  const renderOrderItem = ({ item }) => {
    const productCount = item.order_details.length;
    const savings = roundToTwo(calculateTotalSavings(item.order_details));
    const existingReview = reviews.find((review) => review.local_id === item.local.id);

    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderStatus}>{item.status}</Text>
          <Text style={styles.orderDate}>{formatDateTime(item.date_time)}</Text>
        </View>
        <View style={styles.orderContent}>
          <View style={styles.restaurantInfo}>
            <Image source={{ uri: item.local.logo }} style={styles.restaurantImage} />
            <View>
              <Text style={styles.restaurantName}>{item.local.name}</Text>
              <TouchableOpacity onPress={() => handleViewDetails(item.order_details)}>
                <Text style={styles.orderDetails}>
                  Total: $ {item.total_price} • {productCount} product{productCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.savings}>$ {savings.toFixed(2)} saved with Bodega+</Text>
        </View>
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleReviewPress(item.local.id)}
          >
            <Feather
              name="star"
              size={18}
              color={existingReview ? '#FFD700' : styles.iconColor.color}
            />
            <Text style={styles.actionText}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigateShopWithProducts(item.order_details, item.local.id, item.type)}
            style={styles.actionButton}
          >
            <Feather name="refresh-ccw" size={18} color={styles.iconColor.color} />
            <Text style={styles.actionText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderDetailItem = ({ item }) => (
    <View style={styles.detailCard}>
      <Image
        source={{ uri: item.img || 'https://via.placeholder.com/100' }}
        style={styles.detailImage}
      />
      <View style={styles.detailInfo}>
        <Text style={styles.detailName}>{item.name}</Text>
        <Text style={styles.detailQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.detailPrice}>${item.price}</Text>
      </View>
    </View>
  );

  if (loading) {
    return <OrderSkeletonLoader />;
  }

  const filteredOrders = orders
    .filter((order) => order.status !== 'new order')
    .filter((order) => {
      let matches = true;
      if (selectedDate) {
        const orderDate = dayjs(order.date_time).startOf('day');
        const filterDate = dayjs(selectedDate).startOf('day');
        matches = matches && orderDate.isSame(filterDate);
      }
      if (selectedOrderType) {
        matches = matches && order.type === selectedOrderType;
      }
      return matches;
    });

  const sortedOrders = filteredOrders
    ? [...filteredOrders].sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
    : [];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    iconColor: {
      color: '#000',
    },
    placeholderTextColor: {
      color: '#888',
    },
    savingsCard: {
      margin: 15,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
    },
    savingsCardGradient: {
      padding: 25,
      alignItems: 'center',
      position: 'relative',
    },
    savingsPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
    },
    savingsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    savingsAmount: {
      fontSize: 48,
      fontWeight: '800',
      color: '#fff',
      marginVertical: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    savingsSubtitle: {
      fontSize: 14,
      color: '#fff',
      fontWeight: '500',
      opacity: 0.9,
      letterSpacing: 0.5,
    },
    savingsDollarSign: {
      fontSize: 24,
      fontWeight: '600',
      color: '#fff',
      marginRight: 4,
    },
    savingsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    noOrdersContainer: {
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: 20,
    },
    noOrdersText: {
      fontSize: 18,
      color: '#888',
      marginBottom: 20,
      textAlign: 'center',
    },
    browseButton: {
      backgroundColor: '#FFA500',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    browseButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    orderItem: {
      backgroundColor: '#fff',
      margin: 10,
      borderRadius: 10,
      padding: 15,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    orderStatus: {
      fontWeight: 'bold',
      color: '#000',
    },
    orderDate: {
      color: '#888',
    },
    orderContent: {
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      paddingBottom: 10,
    },
    restaurantInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    restaurantImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    restaurantName: {
      fontWeight: 'bold',
      fontSize: 16,
      color: '#000',
    },
    orderDetails: {
      color: '#888',
    },
    savings: {
      color: '#4CAF50',
      fontWeight: 'bold',
      marginTop: 5,
    },
    orderActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      marginLeft: 5,
      color: '#000',
    },
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    reviewModalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingTop: 25,
      paddingHorizontal: 20,
      paddingBottom: 34,
      maxHeight: '80%',
    },
    reviewModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    reviewModalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    reviewModalContent: {
      marginTop: 20,
    },
    reviewMessage: {
      fontSize: 16,
      marginBottom: 20,
      color: '#000',
    },
    commentInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      height: 120,
      textAlignVertical: 'top',
      marginBottom: 20,
      color: '#000',
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    deleteButton: {
      backgroundColor: '#FF6347',
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 34,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
    },
    closeButton: {
      padding: 5,
    },
    modalContent: {
      paddingBottom: 20,
    },
    detailCard: {
      flexDirection: 'row',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      paddingBottom: 15,
    },
    detailImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 15,
    },
    detailInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    detailName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#000',
    },
    detailQuantity: {
      fontSize: 16,
      color: '#666',
      marginBottom: 5,
    },
    detailPrice: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4CAF50',
    },
    modalFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      paddingTop: 15,
    },
    totalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    filterContainer: {
      marginHorizontal: 15,
      marginBottom: 15,
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      justifyContent: 'space-between',
    },
    filterLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      marginRight: 10,
      flex: 1,
    },
    datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F0F0',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 15,
      flex: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
    datePickerText: {
      fontSize: 16,
      color: '#000',
    },
    orderTypeButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 2,
    },
    orderTypeButton: {
      flex: 1,
      marginHorizontal: 5,
    },
    orderTypeButtonContent: {
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    orderTypeButtonText: {
      fontSize: 16,
      color: '#000',
      fontWeight: '600',
    },
    orderTypeButtonTextSelected: {
      color: '#fff',
    },
    clearFiltersButton: {
      marginTop: 20,
      alignSelf: 'center',
      backgroundColor: '#FFA500',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    clearFiltersText: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Enhanced Savings Card */}
        <View style={styles.savingsCard}>
          <LinearGradient
            colors={['#FF8C00', '#FFA500', '#FF6347']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.savingsCardGradient}
          >
            <View style={styles.savingsPattern}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#fff',
                  opacity: 0.1,
                  transform: [{ rotate: '45deg' }],
                  position: 'absolute',
                }}
              />
            </View>

            <Text style={styles.savingsTitle}>YOU HAVE SAVED</Text>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsDollarSign}>$</Text>
              <Text style={styles.savingsAmount}>{totalUserSavings.toFixed(2)}</Text>
            </View>
            <Text style={styles.savingsSubtitle}>WITH BODEGA+ DISCOUNTS</Text>
          </LinearGradient>
        </View>

        {/* Order Status */}
        {user && token && (
          <OrderStatus
            finishedProcessed={finishedProcessed}
            setFinishedProcessed={setFinishedProcessed}
          />
        )}

        {/* Order List */}
        {sortedOrders.length > 0 ? (
          sortedOrders.map((item) => renderOrderItem({ item }))
        ) : (
          <View style={styles.noOrdersContainer}>
            <Text style={styles.noOrdersText}>You don't have any orders yet!</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Restaurants')}
            >
              <Text style={styles.browseButtonText}>Explore Businesses</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals */}
        {/* Order Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color={styles.iconColor.color} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={selectedOrderDetails}
                renderItem={renderOrderDetailItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.modalContent}
              />
              <View style={styles.modalFooter}>
                <Text style={styles.totalText}>Total:</Text>
                <Text style={styles.totalAmount}>
                  $
                  {selectedOrderDetails
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Review Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showReviewModal}
          onRequestClose={() => setShowReviewModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.reviewModalContainer}>
              <View style={styles.reviewModalHeader}>
                <Text style={styles.reviewModalTitle}>
                  {isEditingReview ? 'Your Review' : 'Leave a Review'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowReviewModal(false)}
                >
                  <Feather name="x" size={24} color={styles.iconColor.color} />
                </TouchableOpacity>
              </View>

              {isEditingReview ? (
                <View style={styles.reviewModalContent}>
                  <View style={styles.ratingContainer}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FontAwesome
                        key={index}
                        name={index < selectedReview.rating ? 'star' : 'star-o'}
                        size={30}
                        color="#FFD700"
                        style={{ marginHorizontal: 5 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewMessage}>{selectedReview.message}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteReview}>
                    <Text style={styles.deleteButtonText}>Delete Review</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.reviewModalContent}>
                  {renderStars()}
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write your review..."
                    placeholderTextColor={styles.placeholderTextColor.color}
                    multiline
                    value={currentReview.message}
                    onChangeText={(text) => setCurrentReview({ ...currentReview, message: text })}
                  />
                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderScreen;
