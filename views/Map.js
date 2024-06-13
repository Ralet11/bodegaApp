import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

const MapViewComponent = () => {
  const dispatch = useDispatch();
  const address = useSelector((state) => state?.user?.address.formatted_address) || '';
  const shopsByCategory = useSelector((state) => state?.setUp?.shops) || {};
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null); // Estado para la categoría seleccionada
  const navigation = useNavigation();

  const categoryTitles = {
    1: 'Smoke Shops',
    2: 'Drinks',
    3: 'Restaurants',
    4: 'Markets',
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
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
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    console.log(address)

    const fetchAddressLocation = async () => {
      try {
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
        }
      } catch (error) {
        console.error('Error fetching address location:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!address) {
      fetchLocation();
    } else {
      fetchAddressLocation();
    }
  }, [address]);

  const handleMarkerPress = (local) => {
    setSelectedLocal(local);
  };

  const handleCloseModal = () => {
    setSelectedLocal(null);
  };

  const handleNavigateToShop = (shop) => {
    navigation.navigate('Shop', { shop });
    setSelectedLocal(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const filteredShops = selectedCategory
    ? shopsByCategory[selectedCategory] || []
    : Object.values(shopsByCategory).flat();

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      ) : (
        region && (
          <>
            <View style={styles.filterContainer}>
              {Object.keys(categoryTitles).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.filterButton,
                    selectedCategory === parseInt(key) && styles.selectedFilterButton,
                  ]}
                  onPress={() => handleCategorySelect(parseInt(key))}
                >
                  <Text style={styles.filterButtonText}>{categoryTitles[key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <MapView style={styles.map} region={region}>
              {marker && <Marker coordinate={marker} />}

              {filteredShops.map((shop) => (
                <Marker
                  key={shop.id}
                  coordinate={{ latitude: shop.lat, longitude: shop.lng }}
                  onPress={() => handleMarkerPress(shop)}
                >
                  <View style={styles.markerContainer}>
                    <View style={styles.circle}>
                      <Image source={{ uri: shop.img }} style={styles.markerImage} />
                    </View>
                  </View>
                  <Callout>
                    <Text>{shop.name}</Text>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          </>
        )
      )}
      <Modal
        visible={!!selectedLocal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedLocal?.img }} style={styles.image} />
            <Text style={styles.modalTitle}>{selectedLocal?.name}</Text>
            <Text>{selectedLocal?.address}</Text>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => handleNavigateToShop(selectedLocal)}
            >
              <Text style={styles.navigateButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  selectedFilterButton: {
    backgroundColor: '#ffcc00',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ffcc00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  navigateButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#008080',
    borderRadius: 5,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#008080',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MapViewComponent;