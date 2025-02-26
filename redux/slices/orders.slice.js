import { createSlice } from '@reduxjs/toolkit';
import Axios from 'react-native-axios/lib/axios';
import { API_URL } from "@env";

const initialState = {
  ordersIn: [],
  status: 'idle', // Puede ser 'idle', 'loading', 'succeeded', 'failed'
  error: null,
  historicOrders: [],
  historicStatus: "",
  historicError: null,
  currentOrder: null,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrderIn: (state, action) => {
      state.ordersIn = [...state.ordersIn, action.payload];
    },
    updateOrderIn: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.ordersIn.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.ordersIn[orderIndex].status = status;
      }
    },
    removeOrderIn: (state, action) => {
      state.ordersIn = state.ordersIn.filter(order => order.id !== action.payload.orderId);
    },
    setOrderStart: (state) => {
      state.status = 'loading';
    },
    setOrderSuccess: (state, action) => {
      state.ordersIn.push({
        info: action.payload.data,
        sendTo: action.payload.selectedAddress,
      });
    },
    setOrderFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    changeOrderStatus: (state, action) => {
      state.ordersIn[0].info.status = action.payload;
    },
    // Reducer finishOrder modificado:
    finishOrder: (state, action) => {
      // Se espera que action.payload sea el objeto de la orden finalizada
      const finishedOrder = action.payload;
      // Removemos la orden de ordersIn utilizando un identificador (por ejemplo, finishedOrder.info.newOrderId)
      state.ordersIn = state.ordersIn.filter(
        order => order.info.newOrderId !== finishedOrder.info.newOrderId
      );
      // Si la orden finalizada aún no existe en historicOrders, la agregamos
      const exists = state.historicOrders.find(
        order => order.info.newOrderId === finishedOrder.info.newOrderId
      );
      if (!exists) {
        state.historicOrders.push(finishedOrder);
      }
    },
    getOrdersByUser: (state, action) => {
      state.historicOrders = action.payload || [];
    },
    getOrdersByUserStart: (state) => {
      state.historicStatus = "loading";
      state.historicOrders = [];
    },
    getOrdersByUserFailure: (state, action) => {
      state.historicStatus = 'failed';
      state.historicError = action.payload;
      state.historicOrders = [];
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setHistoricOrders: (state, action) => {
      state.historicOrders = action.payload;
    },
    clearOrders: (state) => {
      return initialState;
    },
  },
});

export const { 
  setOrderStart, 
  setCurrentOrder, 
  setOrderSuccess, 
  setOrderFailure, 
  getOrdersByUser, 
  getOrdersByUserFailure, 
  getOrdersByUserStart, 
  updateOrderIn, 
  setOrderIn,
  setHistoricOrders,
  removeOrderIn,
  finishOrder, // Ahora actualiza historicOrders
  clearOrders
} = orderSlice.actions;

// Acción asincrónica
export const fetchOrders = (data) => async (dispatch) => {
  try {
    dispatch(setOrderStart());
    dispatch(setOrderSuccess(data));
  } catch (error) {
    dispatch(setOrderFailure(error.message));
  }
};

export const getAllOrders = (data, token) => async (dispatch) => {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    dispatch(getOrdersByUserStart());
    const orders = await Axios.get(`${API_URL}/api/orders/getByUser/${data}`, { headers });
    dispatch(getOrdersByUser(orders.data));
  } catch (error) {
    dispatch(getOrdersByUserFailure(error.message));
  }
};

export default orderSlice.reducer;
