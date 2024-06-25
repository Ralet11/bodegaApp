import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { setCurrentOrder, updateOrderIn, removeOrderIn } from '../redux/slices/orders.slice';
import socketIOClient from "socket.io-client";
import { API_URL } from '@env';
import Axios from 'react-native-axios';

const OrderStatus = () => {
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

          console.log(updateOrderIn.status, "el estado")
          if (updatedOrder.status === 'rejected' || updatedOrder.status === 'finished') {
            dispatch(removeOrderIn({ orderId: updatedOrder.id }));
            dispatch(setCurrentOrder(updatedOrder));
            navigation.navigate('AcceptedOrder');
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
  }, [dispatch, token]);

  

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'new order':
        return {
          mainText: 'Order placed',
          progress: 0.3,
        };
      case 'accepted':
        return {
          mainText: 'Order accepted',
          progress: 0.6,
        };
      case 'sending':
        return {
          mainText: 'Sending your order',
          progress: 1,
        };
      case 'rejected':
        return {
          mainText: 'Order rejected',
          progress: 0,
        };
      case 'finished':
        return {
          mainText: 'Order delivered',
          progress: 1,
        };
      default:
        return {
          mainText: 'Unknown status',
          progress: 0,
        };
    }
  };

  const seeOrder = (item) => {
    if (item.status === 'rejected' || item.status === 'finished') {
      dispatch(removeOrderIn({ orderId: item.id }));
    }
    dispatch(setCurrentOrder(item));
    navigation.navigate('AcceptedOrder');
  };

  const renderItem = ({ item }) => {
    const { mainText, progress } = getOrderStatusText(item.status);

    return (
      <View style={[styles.orderContainer, colorScheme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
        <View style={styles.orderHeader}>
          <Text style={[styles.orderNumber, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order #{item.id}</Text>
          <TouchableOpacity onPress={() => seeOrder(item)}>
            <Text style={[styles.seeOrderText, { color: '#ff9900' }]}>See Order</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.orderStatus, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>{mainText}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ordersIn}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  orderContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  lightContainer: {
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1c1c1c',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeOrderText: {
    fontSize: 14,
  },
  orderStatus: {
    fontSize: 14,
    marginTop: 5,
  },
  lightText: {
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ff9900',
    borderRadius: 2,
  },
});

export default OrderStatus;