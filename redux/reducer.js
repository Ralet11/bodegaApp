import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/user.slice'
import setUpReducer from './slices/setUp.slice'
import cartReducer from './slices/cart.slice'
import currentShopReducer from './slices/currentShop.slice'
import orderReducer from './slices/orders.slice.js'

const rootReducer = combineReducers({
  user: userReducer,
  setUp: setUpReducer,
  cart: cartReducer,
  currentShop: currentShopReducer,
  orders: orderReducer
});

export default rootReducer;