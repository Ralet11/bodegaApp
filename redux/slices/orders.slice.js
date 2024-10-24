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
    finishOrder: (state, action) => {
      const orderIdToRemove = action.payload;
      state.ordersIn = state.ordersIn.filter(order => order.info.newOrderId !== Number(orderIdToRemove));
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
  removeOrderIn, // Exportamos la nueva acción
  clearOrders // Exportamos la acción clearOrders
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
      'Authorization': `Bearer ${token}`, // Aquí debes reemplazar 'tuToken' con el token real que deseas enviar
      'Content-Type': 'application/json', // Esto indica que estás enviando datos en formato JSON
    };
    dispatch(getOrdersByUserStart());
    const orders = await Axios.get(`${API_URL}/api/orders/getByUser/${data}`, { headers });
    dispatch(getOrdersByUser(orders.data));
  } catch (error) {
    dispatch(getOrdersByUserFailure(error.message));
  }
};

export default orderSlice.reducer;