import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';
import persistedReducer from '../redux/reducer';

const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };