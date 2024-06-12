import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: null,
  isAuthenticated: false,
  address: null,
  addresses: [], // Nuevo estado para almacenar todas las direcciones del usuario
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
    },
    setAddress: (state, action) => {
      state.address = action.payload;
    },
    setAddresses: (state, action) => { 
      console.log("enaction")// Nuevo reducer para establecer todas las direcciones
      state.addresses = action.payload;
    },
    addAddress: (state, action) => { // Nuevo reducer para agregar una nueva dirección
      state.addresses.push(action.payload);
    },
    removeAddress: (state, action) => { // Nuevo reducer para eliminar una dirección por ID
      state.addresses = state.addresses.filter(address => address.id !== action.payload);
    },
  },
});

export const { setUser, clearUser, setAddress, setAddresses, addAddress, removeAddress } = userSlice.actions;
export default userSlice.reducer;