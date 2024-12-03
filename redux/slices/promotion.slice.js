import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  adjustedPurchaseCounts: {},
};

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    setAdjustedPurchaseCount(state, action) {
      const { shopId, adjustedPurchaseCount } = action.payload;
      state.adjustedPurchaseCounts[shopId] = adjustedPurchaseCount;
    },
  },
});

export const { setAdjustedPurchaseCount } = promotionsSlice.actions;
export default promotionsSlice.reducer;