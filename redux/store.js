import { configureStore } from '@reduxjs/toolkit';
import persistedReducer from '../redux/reducer';

const store = configureStore({
  reducer: persistedReducer,
});

export default store;