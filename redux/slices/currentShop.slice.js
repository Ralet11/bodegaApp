import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentShop: null,
};

const currentShopSlice = createSlice({
  name: 'currentShop',
  initialState,
  reducers: {
    setCurrentShop(state, action) {
      state.currentShop = action.payload; // Aquí se actualiza el estado con el ID del shop
    },
  },
});

export const { setCurrentShop } = currentShopSlice.actions;
export default currentShopSlice.reducer;