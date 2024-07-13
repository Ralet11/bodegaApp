import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const GOOGLE_API_KEY = 'AIzaSyB8fCVwRXbMe9FAxsrC5CsyfjzpHxowQmE';

const MapViewComponent = () => {
  const dispatch = useDispatch();
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  const shopsByCategory = useSelector((state) => state?.setUp?.shops) || {};
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocalIndex, setSelectedLocalIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef();

  const categoryTitles = {
    2: 'Alcohol',
    3: 'Restaurants',
    5: 'Nightclubs',
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          setLocationPermissionDenied(true);
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

        // Set up location listener
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setRegion((prevRegion) => ({
              ...prevRegion,
              latitude,
              longitude,
            }));
            setMarker({ latitude, longitude });
          }
        );
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    };

    console.log(shopsByCategory, "shops");

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

  const handleMarkerPress = useCallback((local, index) => {
    setSelectedLocalIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLocalIndex(null);
  }, []);

  const handleNavigateToShop = useCallback((shop) => {
    navigation.navigate('Shop', { shop });
    setSelectedLocalIndex(null);
  }, [navigation]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const filterShops = useCallback(() => {
    return selectedCategory
      ? shopsByCategory[selectedCategory]?.filter(shop => shop.orderIn) || []
      : Object.values(shopsByCategory).flat().filter(shop => shop.orderIn);
  }, [selectedCategory, shopsByCategory]);

  const filteredShops = useMemo(() => filterShops(), [filterShops]);

  const handleNext = () => {
    if (selectedLocalIndex < filteredShops.length - 1) {
      const nextIndex = selectedLocalIndex + 1;
      setSelectedLocalIndex(nextIndex);
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handlePrevious = () => {
    if (selectedLocalIndex > 0) {
      const prevIndex = selectedLocalIndex - 1;
      setSelectedLocalIndex(prevIndex);
      flatListRef.current.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  const snapToOffsets = useMemo(
    () => filteredShops.map((_, index) => index * (width * 0.8)),
    [filteredShops]
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={20}
          color="#ffcc00"
        />
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      ) : locationPermissionDenied ? (
        <View style={styles.permissionDeniedContainer}>
          <Text style={styles.permissionDeniedText}>
            Permission to access location was denied. Please enable location services to use the app.
          </Text>
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

              {filteredShops.map((shop, index) => (
                <Marker
                  key={shop.id}
                  coordinate={{ latitude: shop.lat, longitude: shop.lng }}
                  onPress={() => handleMarkerPress(shop, index)}
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
        visible={selectedLocalIndex !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          {selectedLocalIndex !== null && (
            <>
              <TouchableOpacity style={styles.arrowLeft} onPress={handlePrevious}>
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>
              <FlatList
                ref={flatListRef}
                data={filteredShops}
                horizontal
                pagingEnabled
                snapToInterval={width * 0.8}
                snapToAlignment="center"
                decelerationRate="fast"
                snapToOffsets={snapToOffsets}
                renderItem={({ item }) => (
                  <View style={styles.modalContent}>
                    <Image source={{ uri: item.img }} style={styles.modalImage} />
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                    <Text style={styles.modalAddress}>{item.address}</Text>
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => handleNavigateToShop(item)}
                    >
                      <Text style={styles.navigateButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                initialScrollIndex={selectedLocalIndex}
                getItemLayout={(data, index) => (
                  { length: width * 0.8, offset: width * 0.8 * index, index }
                )}
              />
              <TouchableOpacity style={styles.arrowRight} onPress={handleNext}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </>
          )}
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
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionDeniedText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
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
    width: width * 0.8,
    height: 500, // half the modal height
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginHorizontal: width * 0.1,
    marginTop: 130,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffcc00',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modalAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  navigateButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#ffcc00',
    borderRadius: 10,
    marginBottom: 10,
  },
  navigateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#ffcc00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowLeft: {
    position: 'absolute',
    left: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  arrowRight: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MapViewComponent;