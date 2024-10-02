import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import isEqual from 'lodash.isequal';
import Axios from 'react-native-axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const GOOGLE_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';

const MapViewComponent = () => {
  const dispatch = useDispatch();
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  const shopsByCategory = useSelector((state) => state?.setUp?.shopsDiscounts || {}, isEqual);

  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocalIndex, setSelectedLocalIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef();
  const [allTags, setAllTags] = useState([]);
  const [distances, setDistances] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (selectedLocalIndex !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedLocalIndex, fadeAnim, slideAnim, scaleAnim]);

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

    const fetchAddressLocation = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_API_KEY}`
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

  useEffect(() => {
    const fetchDistances = async () => {
      const newDistances = {};
      for (const shop of filteredShops) {
        if (shop.address) {
          try {
            const response = await Axios.get(
              `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
                address
              )}&destinations=${encodeURIComponent(shop.address)}&key=${GOOGLE_API_KEY}`
            );
            const distanceValueKm = response.data.rows[0].elements[0].distance.value / 1000;

            // Convert to miles
            const distanceValueMiles = distanceValueKm * 0.621371;
            const distanceTextMiles = `${distanceValueMiles.toFixed(2)} mi`;

            if (distanceValueMiles <= 20) {
              newDistances[shop.id] = distanceTextMiles;
            }
          } catch (error) {
            console.error('Error fetching distance:', error);
          }
        }
      }
      setDistances(newDistances);
    };

    if (address) {
      fetchDistances();
    }
  }, [address, filteredShops]);

  useEffect(() => {
    const shopsArray = Array.isArray(shopsByCategory)
      ? shopsByCategory.flat()
      : Object.values(shopsByCategory).flat();
    const tagsMap = new Map();

    shopsArray.forEach((shop) => {
      if (shop.tags) {
        shop.tags.forEach((tag) => {
          if (!tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, tag);
          }
        });
      }
    });

    const tagsArray = Array.from(tagsMap.values());
    setAllTags(tagsArray);
  }, [shopsByCategory]);

  const handleMarkerPress = useCallback((local, index) => {
    setSelectedLocalIndex(index);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLocalIndex(null);
  }, []);

  const handleNavigateToShop = useCallback(
    (shop) => {
      navigation.navigate('Shop', { shop });
      setSelectedLocalIndex(null);
    },
    [navigation]
  );

  const handleTagPress = useCallback(
    (tag) => {
      const newSelectedTag = selectedTag && selectedTag.id === tag.id ? null : tag;
      setSelectedTag(newSelectedTag);
    },
    [selectedTag]
  );

  const filterShops = useCallback(() => {
    const allShops = Array.isArray(shopsByCategory)
      ? shopsByCategory.filter((shop) => shop.orderIn)
      : Object.values(shopsByCategory)
          .flat()
          .filter((shop) => shop.orderIn);

    let filtered = allShops;

    if (selectedTag) {
      filtered = filtered.filter(
        (shop) => shop.tags && shop.tags.some((t) => t.id === selectedTag.id)
      );
    }

    return filtered;
  }, [selectedTag, shopsByCategory]);

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

  const renderRating = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        <FontAwesome5 name="star" size={18} color="#FFD700" style={styles.starIcon} />
      </View>
    );
  };

  const openAddressInMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;

    if (Platform.OS === 'ios') {
      Alert.alert(
        'Open in Maps',
        'Would you like to open the address in Google Maps or Apple Maps?',
        [
          {
            text: 'Google Maps',
            onPress: () => Linking.openURL(googleMapsUrl),
          },
          {
            text: 'Apple Maps',
            onPress: () => Linking.openURL(appleMapsUrl),
          },
        ]
      );
    } else {
      Linking.openURL(googleMapsUrl);
    }
  };

  const tagEmojis = {
    Pizza: '🍕',
    Burgers: '🍔',
    Sushi: '🍣',
    Vegan: '🥦',
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={100} style={styles.headerContainer}>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollView}
        >
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                selectedTag && selectedTag.id === tag.id && styles.selectedTagButton,
              ]}
              onPress={() => handleTagPress(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTag && selectedTag.id === tag.id && styles.selectedTagText,
                ]}
              >
                {tagEmojis[tag.name] || '🍽️'} {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>

      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={{ uri: 'https://assets10.lottiefiles.com/packages/lf20_q7uarxsb.json' }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      ) : locationPermissionDenied ? (
        <View style={styles.permissionDeniedContainer}>
          <LottieView
            source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_sB03tR.json' }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.permissionDeniedText}>
            Permiso para acceder a la ubicación denegado. Por favor, habilita los servicios de
            ubicación para usar la aplicación.
          </Text>
        </View>
      ) : (
        region && (
          <MapView style={styles.map} region={region} provider={PROVIDER_GOOGLE}>
            {marker && (
              <Marker coordinate={marker}>
                <View style={styles.userMarker}>
                  <FontAwesome5 name="map-pin" size={24} color="#4A90E2" />
                </View>
              </Marker>
            )}

            {filteredShops.map((shop, index) => (
              <Marker
                key={shop.id}
                coordinate={{ latitude: shop.lat, longitude: shop.lng }}
                onPress={() => handleMarkerPress(shop, index)}
              >
                <Animated.View
                  style={[
                    styles.markerContainer,
                    {
                      transform: [
                        {
                          scale: selectedLocalIndex === index
                            ? scaleAnim.interpolate({
                                inputRange: [0.5, 1],
                                outputRange: [1, 1.2],
                              })
                            : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <Image source={{ uri: shop.logo }} style={styles.markerImage} />
                </Animated.View>
              </Marker>
            ))}
          </MapView>
        )
      )}
      <Modal
        visible={selectedLocalIndex !== null}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {selectedLocalIndex !== null && (
            <>
              <TouchableOpacity style={styles.arrowLeft} onPress={handlePrevious}>
                <FontAwesome5 name="chevron-left" size={24} color="#333" />
              </TouchableOpacity>
              <FlatList
                ref={flatListRef}
                data={filteredShops}
                horizontal
                pagingEnabled
                renderItem={({ item }) => (
                  <Animated.View
                    style={[
                      styles.modalContent,
                      {
                        transform: [{ scale: scaleAnim }],
                      },
                    ]}
                  >
                    <Image source={{ uri: item.placeImage }} style={styles.modalImage} />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.7)', 'transparent']}
                      style={styles.imageOverlay}
                    />
                    <BlurView intensity={90} style={styles.modalInfo}>
                      <Text style={styles.modalTitle}>{item.name}</Text>
                      <View style={styles.ratingDistanceContainer}>
                        {renderRating(item.rating)}
                        {distances[item.id] && (
                          <View style={styles.distanceContainer}>
                            <FontAwesome5 name="street-view" size={14} color="#333" />
                            <Text style={styles.distanceText}>{distances[item.id]}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalAddress} onPress={() => openAddressInMaps(item.address)}>
                        {item.address}
                      </Text>
                      <TouchableOpacity
                        style={styles.navigateButton}
                        onPress={() => handleNavigateToShop(item)}
                      >
                        <Text style={styles.navigateButtonText}>View Shop</Text>
                      </TouchableOpacity>
                    </BlurView>
                  </Animated.View>
                )}
                keyExtractor={(item) => item.id.toString()}
                initialScrollIndex={selectedLocalIndex}
                getItemLayout={(data, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
              <TouchableOpacity style={styles.arrowRight} onPress={handleNext}>
                <FontAwesome5 name="chevron-right" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                <FontAwesome5 name="times" size={24} color="#333" />
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    zIndex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  permissionDeniedText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 11,
    elevation: 11,
  },
  goBackButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  tagsScrollView: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTagButton: {
    backgroundColor: '#4A90E2',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4A90E2',
    overflow: 'hidden',
  },
  markerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width,
    height: height * 0.6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  modalInfo: {
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFECB3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  starIcon: {
    marginLeft: 2,
  },
  modalAddress: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
  },
  navigateButton: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 25,
  },
  arrowLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 25,
  },
  arrowRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 25,
  },
});

export default MapViewComponent;
