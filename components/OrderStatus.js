import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setCurrentOrder, updateOrderIn, removeOrderIn } from '../redux/slices/orders.slice';
import socketIOClient from "socket.io-client";
import { API_URL } from '@env';
import Axios from 'react-native-axios';
import { Package, ArrowRight, CheckCircle, XCircle, Clock, Truck } from 'lucide-react-native';


const OrderItem = React.memo(({ item, onPress, colorScheme }) => {
  const { mainText, icon, color } = getOrderStatusInfo(item);
  const token = useSelector(state => state?.user?.userInfo.data.token);
  const dispatch = useDispatch()

  const navigation = useNavigation();

  useEffect(() => {
    const socket = socketIOClient(`${API_URL}`);

    socket.on('changeOrderState', (data) => {
      const { orderId } = data;
      const fetchOrder = async () => {
        try {
          const response = await Axios.get(`${API_URL}/api/orders/getByOrderId/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data, 'response.data en satus');
          const updatedOrder = response.data;
          dispatch(updateOrderIn({ orderId: updatedOrder.id, status: updatedOrder.status }));

          // Si la orden es "rejected" o "finished", navega a la pantalla correspondiente
          if (updatedOrder.status === 'rejected' || updatedOrder.status === 'finished') {
            dispatch(removeOrderIn({ orderId: updatedOrder.id }));
            dispatch(setCurrentOrder(updatedOrder));

            // Verificar el tipo de orden y navegar a la pantalla correspondiente
            if (updatedOrder.type === 'Delivery') {
              navigation.navigate('AcceptedOrder');
            } else {
              navigation.navigate('PickUpOrderFinish');
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchOrder();
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, token, navigation]);

  return (
    <View
      style={[
        styles.orderContainer,
        colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <TouchableOpacity
        style={styles.orderContent}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          {icon}
          <Text style={[styles.orderNumber, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            Order #{item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: color }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={[styles.orderStatus, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
          {mainText}
        </Text>
        {/* Muestra el código de la orden aquí debajo del estado */}
        <Text style={[styles.orderCode, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
          Order Code: {item.code}
        </Text>
        <View style={styles.seeOrderContainer}>
          <Text style={[styles.seeOrderText, { color: color }]}>See Order Details</Text>
          <ArrowRight color={color} size={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

const getOrderStatusInfo = (order) => {
  const { status, type } = order;
  let mainText = '';
  let icon = null;
  let color = '';

  if (type === 'Order-in') {
    mainText = 'Pick up your order at the shop';
    icon = <Package color="#FFD700" size={24} />;
    color = '#FFD700';
  } else {
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
        mainText = type === 'Pick-up' ? 'Ready for pickup' : 'Order on the way';
        icon = type === 'Pick-up' ? <Package color="#e67e22" size={24} /> : <Truck color="#e67e22" size={24} />;
        color = '#e67e22';
        break;
      case 'rejected':
        mainText = 'Order rejected';
        icon = <XCircle color="#e74c3c" size={24} />;
        color = '#e74c3c';
        break;
      case 'finished':
        mainText = 'Order delivered';
        icon = <CheckCircle color="#27ae60" size={24} />;
        color = '#27ae60';
        break;
      default:
        mainText = 'Unknown status';
        icon = <Clock color="#95a5a6" size={24} />;
        color = '#95a5a6';
    }
  }

  return { mainText, icon, color };
};

const OrderStatus = ({finishedProcessed, setFinishedProcessed}) => {
  const ordersIn = useSelector((state) => state.orders.ordersIn);
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state?.user?.userInfo.data.token);

  useEffect(() => {
    const socket = socketIOClient(`${API_URL}`);

    socket.on('changeOrderState', (data) => {
      const { orderId } = data;
      const fetchOrder = async () => {
        try {
          const response = await Axios.get(`${API_URL}/api/orders/getByOrderId/${orderId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const updatedOrder = response.data;
          dispatch(updateOrderIn({ orderId: updatedOrder.id, status: updatedOrder.status }));

          if (updatedOrder.status === 'rejected' || updatedOrder.status === 'finished') {
            dispatch(removeOrderIn({ orderId: updatedOrder.id }));
            dispatch(setCurrentOrder(updatedOrder));
            setFinishedProcessed(!finishedProcessed)

            if (updatedOrder.type === 'Delivery') {
              navigation.navigate('AcceptedOrder');
            } else {
              navigation.navigate('PickUpOrderFinish');
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchOrder();
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, token, navigation]);

  const handleSeeOrder = useCallback((item) => {
    if (item.status === 'rejected' || item.status === 'finished') {
      dispatch(removeOrderIn({ orderId: item.id }));
    }
    dispatch(setCurrentOrder(item));

    if (item.type === 'Delivery') {
      navigation.navigate('AcceptedOrder');
    } else {
      navigation.navigate('PickUpOrderFinish');
    }
  }, [dispatch, navigation]);

  const renderOrderItem = useCallback(({ item }) => (
    <OrderItem
      item={item}
      onPress={handleSeeOrder}
      colorScheme={colorScheme}
    />
  ), [handleSeeOrder, colorScheme]);

  return (
    <FlatList
      data={ordersIn.filter(order => order.status !== 'cancelled')}
      renderItem={renderOrderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.orderList}
    />
  );
};

const styles = StyleSheet.create({
  orderList: {
    padding: 16,
  },
  orderContainer: {
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  darkContainer: {
    backgroundColor: '#2c2c2c',
  },
  orderContent: {
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderStatus: {
    fontSize: 16,
    marginBottom: 8, // Reduce el margen para ajustarlo mejor
  },
  orderCode: {
    fontSize: 14,
    color: '#7f8c8d', // Un tono gris para diferenciar el código
    marginBottom: 12,
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#f0f0f0',
  },
  seeOrderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  seeOrderText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

export default OrderStatus;
