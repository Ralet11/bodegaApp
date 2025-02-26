// useSocket.js
import { useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';

// Acciones de Redux
import { updateOrderIn, removeOrderIn, setCurrentOrder, getAllOrders } from '../redux/slices/orders.slice';
import { setOrderAux } from '../redux/slices/setUp.slice';

export default function useSocket() {
  const dispatch = useDispatch();
  const token = useSelector(state => state.user?.userInfo?.data?.token);
  const user = useSelector(state => state.user?.userInfo?.data?.client);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = socketIOClient(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket conectado =>', socket.id);
      socket.emit('joinRoom', user.id);
    });

    socket.on('changeOrderState', async data => {
      console.log("changeOrderState recibido:", data);
      try {
        const { orderId } = data;
        const response = await Axios.get(`${API_URL}/api/orders/getByOrderId/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedOrder = response.data;

        if (updatedOrder.status === 'finished' || updatedOrder.status === 'rejected') {
          dispatch(removeOrderIn({ orderId: updatedOrder.id }));
          dispatch(setCurrentOrder(null));
          dispatch(setOrderAux()); // Para refrescar las órdenes en OrdersView
          dispatch(getAllOrders(user.id, token));
        } else {
          dispatch(updateOrderIn({
            orderId: updatedOrder.id,
            status: updatedOrder.status,
          }));
        }
      } catch (error) {
        console.log('Error en changeOrderState =>', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    return () => {
      if (socketRef.current) {
        console.log('Desconectando socket...');
        socketRef.current.disconnect();
      }
    };
  }, [user?.id, token, dispatch]);

  return socketRef.current;
}
