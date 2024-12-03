import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import userReducer from './slices/user.slice'
import setUpReducer from './slices/setUp.slice'
import cartReducer from './slices/cart.slice'
import currentShopReducer from './slices/currentShop.slice'
import orderReducer from './slices/orders.slice.js'
import AsyncStorage from '@react-native-async-storage/async-storage';
import promotionsReducer from './slices/promotion.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'setUp', 'cart', 'currentShop', 'orders', "promotions"] // Reducers a persistir
};

const rootReducer = combineReducers({
  user: userReducer,
  setUp: setUpReducer,
  cart: cartReducer,
  currentShop: currentShopReducer,
  orders: orderReducer,
  promotions: promotionsReducer,

});

const persistedReducer = persistReducer(persistConfig, rootReducer)

export default persistedReducer;