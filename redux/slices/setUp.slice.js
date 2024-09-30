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
  shopsDiscounts:[]
};

const setUpSlice = createSlice({
  name: 'setUp',
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setShops: (state, action) => {
      state.shops = action.payload
    },
    setShopsDiscounts: (state, action) => {
      state.shopsDiscounts = action.payload
    },
    setAuxShops: (state) => {
      state.auxShops = state.auxShops + 1
    },
    setUserDiscounts: (state, action) => {
      state.userDiscounts = action.payload
    }
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

export const { setCategories, setShops, setAuxShops, setUserDiscounts, setShopsDiscounts } = setUpSlice.actions;
export default setUpSlice.reducer;