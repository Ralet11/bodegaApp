import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  address: null,
  addresses: [], // Estado para almacenar todas las direcciones del usuario
  location: null, // Nueva propiedad para almacenar la location
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.address = null;
      state.addresses = [];
      state.location = null;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.address = null;
      state.addresses = [];
      state.location = null;
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setAddresses: (state, action) => {
      state.addresses = action.payload;
    },
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
    },
    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter(address => address.id !== action.payload);
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  logout, 
  setAddress, 
  setAddresses, 
  addAddress, 
  removeAddress, 
  setLocation 
} = userSlice.actions;
export default userSlice.reducer;
