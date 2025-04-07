import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Modal } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios';
import Toast from 'react-native-toast-message';
import { addAddress, setAddress } from '../redux/slices/user.slice';
import { API_URL } from '@env';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';

const SetAddressScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  const [region, setRegion] = useState(null);
  const [addressState, setAddressState] = useState(address);
  const [marker, setMarker] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [addressesState, setAddressesState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const token = useSelector((state) => state?.user.userInfo.data.token);
  const user = useSelector((state) => state?.user.userInfo.data.client);

  const defaultLocation = {
    latitude: 40.7128, // Coordenadas para Nueva York como ejemplo
    longitude: -74.0060,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };

  const fetchCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        setRegion(defaultLocation);
        setMarker(defaultLocation);
        setAddressState('New York, NY, USA'); // Puedes ajustar la dirección predeterminada aquí
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });

      setMarker({ latitude, longitude });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        setAddressState(json.results[0].formatted_address);
        setAddressesState(json.results[0]);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setRegion(defaultLocation);
      setMarker(defaultLocation);
      setAddressState('New York, NY, USA'); // Puedes ajustar la dirección predeterminada aquí
    } finally {
      setLoading(false);
    }
  };

  const fetchAddressLocation = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        const location = json.results[0].geometry.location;
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
        setMarker({
          latitude: location.lat,
          longitude: location.lng,
        });
        setAddressState(json.results[0].formatted_address);
        setAddressesState(json.results[0]);
      }
    } catch (error) {
      console.error('Error fetching address location:', error);
      setRegion(defaultLocation);
      setMarker(defaultLocation);
      setAddressState('New York, NY, USA'); // Puedes ajustar la dirección predeterminada aquí
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address) {
      fetchCurrentLocation();
    } else {
      fetchAddressLocation();
    }
  }, [address]);

  const fetchAddress = async (latitude, longitude) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        setAddressState(json.results[0].formatted_address);
      }
    } catch (error) {
      console.warn('Error fetching address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = useCallback((e) => {
    const { coordinate } = e.nativeEvent;
    setMarker(coordinate);
    setRegion((prevRegion) => ({
      ...prevRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));
    fetchAddress(coordinate.latitude, coordinate.longitude);
  }, []);

  const handleAddressSelect = useCallback((data, details = null) => {
    if (details) {
      const location = details.geometry.location;
      setRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      });
      setMarker({
        latitude: location.lat,
        longitude: location.lng,
      });
      setAddressState(details.formatted_address);
      setAddressesState(details);
    }
  }, []);

  const handleSaveAddress = useCallback(async () => {
    try {
      const response = await Axios.post(
        `${API_URL}/api/addresses/addToUser`,
        {
          name: addressName,
          houseNumber,
          additionalDetails,
          formatted_address: addressState,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {

        dispatch(setAddress(response.data));
        dispatch(addAddress(response.data));
        setModalVisible(false);
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
  }, [addressName, houseNumber, additionalDetails, addressState, dispatch, navigation, token]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Address</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : (
          <>
            {region && (
              <MapView
                style={styles.map}
                region={region}
                onPress={handleMapPress}
              >
                {marker && <Marker coordinate={marker} />}
              </MapView>
            )}
            <View style={styles.searchContainer}>
              <GooglePlacesAutocomplete
                placeholder="Enter your street and number"
                minLength={2}
                fetchDetails={true}
                onPress={handleAddressSelect}
                query={{
                  key: GOOGLE_API_KEY,
                  language: 'en',
                }}
                styles={{
                  container: {
                    flex: 1,
                    zIndex: 2,
                  },
                  textInputContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 5,
                    marginHorizontal: 20,
                  },
                  textInput: {
                    flex: 1,
                    height: 44,
                    color: '#5d5d5d',
                    fontSize: 16,
                    paddingHorizontal: 10,
                    borderRadius: 10,
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                  listView: {
                    backgroundColor: 'white',
                    marginHorizontal: 20,
                    borderRadius: 10,
                    elevation: 5,
                  },
                  description: {
                    fontSize: 16,
                  },
                }}
                renderLeftButton={() => (
                  <Ionicons name="search" size={20} color="#1faadb" style={{ marginLeft: 10 }} />
                )}
                debounce={200}
              />
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{addressState}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => user?.role === 'guest' ? handleSaveAddress() : setModalVisible(true)}
              >
                <Text style={styles.buttonText}>{user?.role === 'guest' ? 'Use this address as guest' : 'Save Address'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      {user?.role !== 'guest' && (
        <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Address Details</Text>
          
          <Text style={styles.label}>Home Name</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Home Name (e.g. My Home)"
            value={addressName}
            onChangeText={setAddressName}
          />
          
          <Text style={styles.label}>House Number</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="House Number (e.g. 123)"
            value={houseNumber}
            onChangeText={setHouseNumber}
          />
          
          <Text style={styles.label}>Delivery Information</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Delivery Information (e.g. Apt 1B, Floor 2)"
            value={additionalDetails}
            onChangeText={setAdditionalDetails}
          />
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleSaveAddress}
          >
            <Text style={styles.modalButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
      )}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  map: {
    flex: 1,
    zIndex: 0,
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    zIndex: 2,
  },
  addressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    alignItems: 'center',
    zIndex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#008080',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  modalButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#008080',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SetAddressScreen;