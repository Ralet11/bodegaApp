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
  useColorScheme,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../redux/slices/orders.slice';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import OrderSkeletonLoader from '../components/SkeletonOrder';
import Axios from 'react-native-axios';
import { API_URL } from '@env'; // Replace with your actual API URL
import OrderStatus from '../components/OrderStatus';

const OrderScreen = () => {
  const orders = useSelector((state) => state?.orders?.historicOrders || []);
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.user?.userInfo);
  const user = userInfo?.data?.client || null;
  const token = userInfo?.data?.token || null;
  const navigation = useNavigation();
  const scheme = useColorScheme(); // Detects the current color scheme

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentReview, setCurrentReview] = useState({ rating: 0, message: '' });
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewLocalId, setReviewLocalId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [finishedProcessed, setFinishedProcessed] = useState(false);

  // Function to round to two decimal places
  const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const totalUserSavings = user ? roundToTwo(Number(user.savings || 0)) : 0;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (user) {
          const response = await Axios.get(`${API_URL}/api/reviews/getByUser/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReviews(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (user && user.role !== 'guest') {
      dispatch(getAllOrders(user.id, token)).then(() => setLoading(false));
      fetchReviews();
    } else {
      setLoading(false);
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
    if (user && user.role !== 'guest') {
      dispatch(getAllOrders(user.id, token));
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [finishedProcessed]);

  const calculateTotalSavings = (orderDetails) => {
    const totalSavings = orderDetails.reduce((total, item) => {
      const originalPrice = parseFloat(item.originalPrice || 0);
      const currentPrice = parseFloat(item.currentPrice || 0);
      const quantity = item.quantity || 1;
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
      if (selectedReview) {
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

  const handleSubmitReview = async () => {
    try {
      if (user) {
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
      if (user && user.role !== 'guest') {
        await dispatch(getAllOrders(user.id, token));
        const reviewsResponse = await Axios.get(`${API_URL}/api/reviews/getByUser/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(reviewsResponse.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrdersAndReviews();
  }, [dispatch, user, token]);

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
    .filter((order) => (filterStatus ? order.status === filterStatus : true));
  const sortedOrders = filteredOrders
    ? [...filteredOrders].sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
    : [];

  const styles = scheme === 'dark' ? darkStyles : lightStyles;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Savings Card */}
        <View style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>YOU HAVE SAVED</Text>
          <Text style={styles.savingsAmount}>${totalUserSavings.toFixed(2)}</Text>
          <Text style={styles.savingsSubtitle}>WITH BODEGA+ DISCOUNTS</Text>
        </View>

        {/* Orders List */}
        {sortedOrders.length > 0 ? (
          sortedOrders.map((item) => renderOrderItem({ item }))
        ) : (
          <View style={styles.noOrdersContainer}>
            <Text style={styles.noOrdersText}>You have no orders yet!</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Main', { screen: 'Discounts' })}
            >
              <Text style={styles.browseButtonText}>Explore Businesses</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals for order details and reviews */}
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
                    onChangeText={(text) =>
                      setCurrentReview({ ...currentReview, message: text })
                    }
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
const commonStyles = {
  container: {
    flex: 1,
  },
  iconColor: {
    color: '#000',
  },
  placeholderTextColor: {
    color: '#888',
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f5f5f5',
  },
  iconColor: {
    color: '#000',
  },
  placeholderTextColor: {
    color: '#888',
  },
  savingsCard: {
    backgroundColor: '#FFA500',
    padding: 20,
    borderRadius: 15,
    margin: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  savingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  savingsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  savingsSubtitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  filterText: {
    marginLeft: 10,
    marginRight: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonText: {
    color: '#000',
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
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  iconColor: {
    color: '#fff',
  },
  placeholderTextColor: {
    color: '#aaa',
  },
  savingsCard: {
    backgroundColor: '#FFA500',
    padding: 20,
    borderRadius: 15,
    margin: 15,
    alignItems: 'center',
  },
  noOrdersContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  noOrdersText: {
    fontSize: 18,
    color: '#ccc',
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
  savingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  savingsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 5,
  },
  savingsSubtitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1E1E1E',
  },
  filterText: {
    marginLeft: 10,
    marginRight: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonText: {
    color: '#fff',
  },
  orderItem: {
    backgroundColor: '#1E1E1E',
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
    color: '#fff',
  },
  orderDate: {
    color: '#ccc',
  },
  orderContent: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    color: '#fff',
  },
  orderDetails: {
    color: '#ccc',
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
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  reviewModalContainer: {
    backgroundColor: '#1E1E1E',
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
    color: '#fff',
  },
  reviewModalContent: {
    marginTop: 20,
  },
  reviewMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#fff',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: '#fff',
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
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    shadowColor: '#fff',
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
    color: '#fff',
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
    borderBottomColor: '#333',
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
    color: '#fff',
  },
  detailQuantity: {
    fontSize: 16,
    color: '#ccc',
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
    borderTopColor: '#333',
    paddingTop: 15,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default OrderScreen;
