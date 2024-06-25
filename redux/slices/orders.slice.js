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
      console.log(orderId, status)
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
      console.log(action.payload, "prueba 1234");
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
      console.log(state.ordersIn[0].info.status, "orders in");
      console.log(action);
      state.ordersIn[0].info.status = action.payload;
    },
    finishOrder: (state, action) => {
      console.log(action.payload, "en el action del finish");
      const orderIdToRemove = action.payload;
      state.ordersIn = state.ordersIn.filter(order => order.info.newOrderId !== Number(orderIdToRemove));
      console.log(state.ordersIn, "asdasd");
    },
    getOrdersByUser: (state, action) => {
      state.historicOrders = action.payload; // Ajusta esto según la estructura real de tu respuesta
    },
    getOrdersByUserStart: (state) => {
      console.log("start");
      state.historicStatus = "loading";
    },
    getOrdersByUserFailure: (state, action) => {
      state.historicStatus = 'failed';
      state.historicError = action.payload;
      console.log(action.payload);
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
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
  removeOrderIn // Exportamos la nueva acción
} = orderSlice.actions;

// Acción asincrónica
export const fetchOrders = (data) => async (dispatch) => {
  console.log(data, "en el slice de orders");
  try {
    dispatch(setOrderStart());
    dispatch(setOrderSuccess(data));
  } catch (error) {
    dispatch(setOrderFailure(error.message));
  }
};

export const getAllOrders = (data, token) => async (dispatch) => {
  console.log(data, "en el slice de orders");
  try {
    const headers = {
      'Authorization': `Bearer ${token}`, // Aquí debes reemplazar 'tuToken' con el token real que deseas enviar
      'Content-Type': 'application/json', // Esto indica que estás enviando datos en formato JSON
    };
    dispatch(getOrdersByUserStart());
    const orders = await Axios.get(`${API_URL}/api/orders/getByUser/${data}`, { headers });
    console.log(orders.data, "orders data");
    dispatch(getOrdersByUser(orders.data));
  } catch (error) {
    dispatch(getOrdersByUserFailure(error.message));
  }
};

export default orderSlice.reducer;
