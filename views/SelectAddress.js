import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { setAddress } from '../redux/slices/user.slice'; // Ajusta la ruta según la ubicación de tu archivo userSlice

const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

const SetAddressScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const address = useSelector((state) => state?.user?.address) || '';
  const [region, setRegion] = useState(null);
  const [addressState, setAddressState] = useState(address);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (!address) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
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
        }
      })();
    } else {
      // Si hay una dirección, usamos esa dirección para establecer el marcador
      (async () => {
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
        }
      })();
    }
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      const json = await response.json();
      if (json.results.length > 0) {
        setAddressState(json.results[0].formatted_address);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const handleRegionChangeComplete = (region) => {
    setRegion(region);
  };

  const handleMapPress = (e) => {
    const { coordinate } = e.nativeEvent;
    setMarker(coordinate);
    setRegion({
      ...region,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    fetchAddress(coordinate.latitude, coordinate.longitude);
  };

  const handleAddressSelect = (data, details = null) => {
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
    }
  };

  const handleSaveAddress = () => {
    dispatch(setAddress(addressState));
    navigation.navigate('Home'); // Navega a la pantalla "Dashboard"
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {region && (
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={handleRegionChangeComplete}
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
                position: 'absolute',
                width: '100%',
                top: 10,
                zIndex: 1,
              },
              textInputContainer: {
                width: '100%',
                backgroundColor: 'rgba(255,255,255,1)',
                borderTopWidth: 0,
                borderBottomWidth: 0,
                paddingHorizontal: 20,
              },
              textInput: {
                height: 44,
                color: '#5d5d5d',
                fontSize: 16,
                paddingHorizontal: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#ddd',
                backgroundColor: '#f9f9f9',
              },
              listView: {
                backgroundColor: 'white',
              },
              description: {
                fontSize: 16,
              },
            }}
            debounce={200}
          />
        </View>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{addressState}</Text>
          <TouchableOpacity style={styles.button} onPress={handleSaveAddress}>
            <Text style={styles.buttonText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  map: {
    flex: 1,
    zIndex: 0,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1,
  },
  addressContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    alignItems: 'center',
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
});

export default SetAddressScreen;