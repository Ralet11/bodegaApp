import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'react-native-axios';
import * as Location from 'expo-location';
import { API_URL } from '@env';
import {
  setAddress,
  setAddresses,
  removeAddress,
  setLocation,
} from '../redux/slices/user.slice';

const AddressesView = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userInfo);
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const selectedAddress = useSelector((state) => state.user.address);
  // Se obtiene la ubicación actual almacenada en redux (propiedad "location")
  const reduxLocation = useSelector((state) => state.user.location);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cada vez que la pantalla regresa a foco, recarga dirección y ubicación
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSavedAddresses();
      fetchCurrentLocation();
    });
    return unsubscribe;
  }, [navigation, token]);

  // Al montar o si cambian user.id / token, traer datos
  useEffect(() => {
    fetchSavedAddresses();
    fetchCurrentLocation();
  }, [user?.id, token]);

  const fetchSavedAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/addresses/getById`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedAddresses(response.data);
      dispatch(setAddresses(response.data));
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission not granted');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = loc.coords;
      let geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode && geocode.length > 0) {
        const formatted_address = `${geocode[0].street || ''} ${
          geocode[0].name || ''
        }, ${geocode[0].city || ''}, ${geocode[0].region || ''}, ${
          geocode[0].postalCode || ''
        }, ${geocode[0].country || ''}`.trim();

        const locationAddress = {
          // Para diferenciar de las direcciones guardadas
          id: 'current_location',
          name: 'Current Location',
          formatted_address,
          latitude,
          longitude,
        };

        setCurrentLocation(locationAddress);
        // Actualiza en Redux la ubicación
        dispatch(setLocation(locationAddress));
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(
        `${API_URL}/api/addresses/deleteAddress/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresca la lista
      fetchSavedAddresses();

      // Si la dirección eliminada era la seleccionada, asigna la ubicación actual
      if (
        selectedAddress &&
        (selectedAddress.adressID === id ||
          selectedAddress.id === id)
      ) {
        dispatch(setAddress(currentLocation));
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleSelectAddress = (addr) => {
    dispatch(setAddress(addr));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Address</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>
          This is your current location
        </Text>

        {!currentLocation ? (
          <ActivityIndicator size="small" color="#ff9900" />
        ) : (
          <TouchableOpacity
            style={[
              styles.addressCard,
              (selectedAddress?.id === currentLocation.id ||
                selectedAddress?.adressID === currentLocation.id) &&
                styles.selectedAddressCard,
            ]}
            onPress={() => handleSelectAddress(currentLocation)}
            activeOpacity={0.8}
          >
            <Icon
              name="map-marker"
              size={24}
              color="#666"
              style={styles.locationIcon}
            />
            <View style={styles.addressInfo}>
              <Text style={styles.addressName}>
                {currentLocation.name}
              </Text>
              <Text style={styles.addressDescription}>
                {currentLocation.formatted_address}
              </Text>
            </View>
            {(selectedAddress?.id === currentLocation.id ||
              selectedAddress?.adressID === currentLocation.id) && (
              <Icon
                name="check-circle"
                size={20}
                color="#ff9900"
                style={styles.tickIcon}
              />
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Your saved addresses</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#ff9900" />
        ) : (
          <>
            {savedAddresses.length > 0 ? (
              savedAddresses.map((addr) => {
                const isSelected =
                  (selectedAddress?.adressID === addr.adressID) ||
                  (selectedAddress?.id === addr.adressID);
                return (
                  <TouchableOpacity
                    key={addr.adressID}
                    style={[
                      styles.addressCard,
                      isSelected && styles.selectedAddressCard,
                    ]}
                    onPress={() => handleSelectAddress(addr)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="map-marker"
                      size={24}
                      color="#666"
                      style={styles.locationIcon}
                    />
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressName}>
                        {addr.formatted_address}
                      </Text>
                      <Text style={styles.addressDescription}>
                        {addr.name || 'No type'}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon
                        name="check-circle"
                        size={20}
                        color="#ff9900"
                        style={styles.tickIcon}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAddress(addr.adressID)}
                    >
                      <Icon name="trash-can" size={20} color="#666" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noAddressesText}>
                You have no saved addresses.
              </Text>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SelectNewAddress')}
        >
          <Icon
            name="plus"
            size={20}
            color="#FFF"
            style={styles.addIcon}
          />
          <Text style={styles.addButtonText}>+ Add Address</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: { elevation: 1 },
    }),
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
  },
  backButton: { padding: 4 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginVertical: 10,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedAddressCard: { borderWidth: 1, borderColor: '#ff9900' },
  locationIcon: { marginRight: 12 },
  addressInfo: { flex: 1 },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  addressDescription: { fontSize: 13, color: '#666' },
  tickIcon: { marginRight: 12 },
  deleteButton: { padding: 4, marginLeft: 8, zIndex: 1 },
  noAddressesText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9900',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
  },
  addIcon: { marginRight: 8 },
  addButtonText: { color: '#FFF', fontSize: 15, fontWeight: '500' },
});

export default AddressesView;
