import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'react-native-axios';
import { API_URL } from '@env';

export const fetchCategories = createAsyncThunk(
  'setUp/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await Axios.get(`${API_URL}/api/locals_categories/app/getAll`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  categories: [],
  shops: [],
  status: 'idle',
  error: null,
  auxShops: 0,
  userDiscounts: [],
  shopsDiscounts: [],
  orderAux: 0,
};

const setUpSlice = createSlice({
  name: 'setUp',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setShops: (state, action) => {
      state.shops = action.payload;
    },
    setShopsDiscounts: (state, action) => {
      state.shopsDiscounts = action.payload;
    },
    setAuxShops: (state) => {
      state.auxShops = state.auxShops + 1;
    },
    setOrderAux: (state) => {
      state.orderAux = state.orderAux + 1;
    },
    setUserDiscounts: (state, action) => {
      state.userDiscounts = action.payload;
    },
    // Nueva acción para limpiar el estado
    clearSetUp: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Exportamos la nueva acción clearSetUp
export const { setCategories, setShops, setAuxShops, setUserDiscounts, setShopsDiscounts, setOrderAux, clearSetUp } = setUpSlice.actions;
export default setUpSlice.reducer;
