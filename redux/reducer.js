// reducer.js
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import userReducer from './slices/user.slice';
import setUpReducer from './slices/setUp.slice';
import cartReducer from './slices/cart.slice';
import currentShopReducer from './slices/currentShop.slice';
import orderReducer from './slices/orders.slice';
import promotionsReducer from './slices/promotion.slice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'setUp', 'cart', 'currentShop', 'orders', 'promotions'],
};

const appReducer = combineReducers({
  user: userReducer,
  setUp: setUpReducer,
  cart: cartReducer,
  currentShop: currentShopReducer,
  orders: orderReducer,
  promotions: promotionsReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'user/logout') {
    // Reinicia todo el estado de Redux
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
