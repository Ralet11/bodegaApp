import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, useColorScheme, Image, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../redux/slices/orders.slice';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import OrderSkeletonLoader from '../components/SkeletonOrder';

const OrderScreen = () => {
  const orders = useSelector((state) => state?.orders.historicOrders);
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user.userInfo.data.client);
  const token = useSelector((state) => state?.user.userInfo.data.token);
  const navigation = useNavigation();
  const scheme = useColorScheme();
  const styles = scheme === 'dark' ? darkStyles : lightStyles;

  console.log(orders, "orsers")

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);  // State to manage loading

  

  useEffect(() => {
    if (user && user.role !== 'guest') {
      dispatch(getAllOrders(user.id, token)).then(() => setLoading(false));  // Set loading to false once data is fetched
    } else {
      setLoading(false); // Set loading to false immediately if user is a guest
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return styles.completedStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'cancelled':
        return styles.cancelledStatus;
      case 'in-progress':
        return styles.inProgressStatus;
      default:
        return styles.defaultStatus;
    }
  };

  if (loading) {
    return <OrderSkeletonLoader />;  // Show loader while loading
  }

  const sortedOrders = orders ? [...orders].sort((a, b) => new Date(b.date_time) - new Date(a.date_time)) : [];

  return (
    <SafeAreaView style={[styles.container, scheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color={scheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      {user.role === 'guest' ? (
        <View style={styles.guestContainer}>
          <Text style={styles.guestText}>To view your orders, please log in or sign up</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.orderButton}>
            <Text style={styles.orderButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.orderButton}>
            <Text style={styles.orderButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}>
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => (
              <View key={order.id} style={styles.card}>
                <Text style={styles.cardHeader}>Order #{order.id}</Text>
                <Text style={[styles.status, getStatusStyle(order.status)]}>{order.status}</Text>
                <Text style={styles.date}>{formatDateTime(order.date_time)}</Text>
                <Text style={styles.total}>Total Price: ${order.total_price}</Text>
                <Text style={styles.localInfo}>{order.local.name}</Text>
                <View style={styles.itemsContainer}>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsText}>Details</Text>
                    <TouchableOpacity onPress={() => handleViewDetails(order.order_details)}>
                      <Text style={styles.detailsLink}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.noOrdersText}>No orders have been made yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.orderButton}>
                <Text style={styles.orderButtonText}>Start Ordering</Text>
              </TouchableOpacity>
              <Text style={styles.tipText}>Tip: Explore our menu and make your first order!</Text>
            </View>
          )}
        </ScrollView>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Order Details</Text>
              {selectedOrderDetails.map((item) => (
                <View key={item.id} style={styles.detailCard}>
                  <Image source={{ uri: item.img }} style={styles.detailImage} />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailName}>{item.name}</Text>
            
                    <Text style={styles.detailPrice}>Price: {item.price}</Text>
                    <Text style={styles.detailQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const commonStyles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexGrow: 1, // Asegura que el contenido crezca para llenar la vista
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
  },
  localInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  itemsContainer: {
    marginTop: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsLink: {
    fontSize: 16,
    color: '#ffcc00',
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noOrdersImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  orderButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 20,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailCard: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  detailImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailPrice: {
    fontSize: 14,
    marginBottom: 5,
  },
  detailQuantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  guestText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  completedStatus: {
    color: '#4caf50',  // Verde para órdenes completadas
  },
  pendingStatus: {
    color: '#ffa500',  // Naranja para órdenes pendientes
  },
  cancelledStatus: {
    color: '#ff0000',  // Rojo para órdenes canceladas
  },
  inProgressStatus: {
    color: '#2196f3',  // Azul para órdenes en progreso
  },
  defaultStatus: {
    color: '#000',  // Negro para cualquier otro estado
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f0f0f0',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#333',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
  },
  backButtonText: {
    ...commonStyles.backButtonText,
    color: '#000',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    color: '#000',
  },
  date: {
    ...commonStyles.date,
    color: '#666',
  },
  localInfo: {
    ...commonStyles.localInfo,
    color: '#333',
  },
  detailsText: {
    ...commonStyles.detailsText,
    color: '#000',
  },
  total: {
    ...commonStyles.total,
    color: '#000',
  },
  noOrdersText: {
    ...commonStyles.noOrdersText,
    color: '#000',
  },
  orderButtonText: {
    ...commonStyles.orderButtonText,
    color: '#000',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: '#fff',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#000',
  },
  closeButton: {
    ...commonStyles.closeButton,
    backgroundColor: '#ffcc00',
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#000',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#333',
    borderBottomColor: '#555',
  },
  detailName: {
    ...commonStyles.detailName,
    color: '#fff',  // Asegúrate de que el nombre sea blanco
  },
  detailDescription: {
    ...commonStyles.detailDescription,
    color: '#fff',  // Asegúrate de que la descripción sea blanca
  },
  detailPrice: {
    ...commonStyles.detailPrice,
    color: '#fff',  // Asegúrate de que el precio sea blanco
  },
  detailQuantity: {
    ...commonStyles.detailQuantity,
    color: '#fff',  // Asegúrate de que la cantidad sea blanca
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    shadowColor: '#fff',
  },
  backButtonText: {
    ...commonStyles.backButtonText,
    color: '#fff',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    color: '#fff',
  },
  date: {
    ...commonStyles.date,
    color: '#aaa',
  },
  localInfo: {
    ...commonStyles.localInfo,
    color: '#ccc',
  },
  detailsText: {
    ...commonStyles.detailsText,
    color: '#fff',
  },
  total: {
    ...commonStyles.total,
    color: '#fff',
  },
  noOrdersText: {
    ...commonStyles.noOrdersText,
    color: '#fff',
  },
  orderButtonText: {
    ...commonStyles.orderButtonText,
    color: '#000',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#fff',
  },
  closeButton: {
    ...commonStyles.closeButton,
    backgroundColor: '#ffcc00',
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#000',
  },
});

export default OrderScreen;