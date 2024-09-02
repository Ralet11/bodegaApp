import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart(state, action) {
      const { id, selectedExtras } = action.payload;
      
      // Encuentra el índice del producto en el carrito que tiene el mismo id y extras
      const itemIndex = state.items.findIndex(item => 
        item.id === id && 
        areExtrasEqual(item.selectedExtras, selectedExtras)
      );

      if (itemIndex >= 0) {
        // Si el producto con los mismos extras ya existe, incrementa la cantidad
        state.items[itemIndex].quantity += action.payload.quantity;
      } else {
        // Si no, agrégalo como un nuevo producto en el carrito
        state.items.push(action.payload);
      }
    },
    incrementQuantity(state, action) {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity += 1;
      }
    },
    decrementQuantity(state, action) {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      if (itemIndex >= 0) {
        if (state.items[itemIndex].quantity > 1) {
          state.items[itemIndex].quantity -= 1;
        } else {
          state.items.splice(itemIndex, 1);
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

const areExtrasEqual = (extras1, extras2) => {
  if (!extras1 || !extras2) return false;
  const keys1 = Object.keys(extras1);
  const keys2 = Object.keys(extras2);
  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    const option1 = extras1[key];
    const option2 = extras2[key];
    if (!option2 || option1.name !== option2.name || option1.price !== option2.price) {
      return false;
    }
  }
  return true;
};

export const { addToCart, incrementQuantity, decrementQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;