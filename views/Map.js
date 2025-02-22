import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import isEqual from 'lodash.isequal';
import Axios from 'react-native-axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const GOOGLE_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc'; // Reemplaza con tu API key real

const MapViewComponent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Estados de Redux
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';
  const shopsByCategory = useSelector((state) => state?.setUp?.shopsDiscounts || {}, isEqual);

  // Estados del componente
  const [region, setRegion] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedLocalIndex, setSelectedLocalIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [distances, setDistances] = useState({});

  const flatListRef = useRef();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  /**
   * Manejo de animaciones de modal (abrir / cerrar):
   * Se cambia useNativeDriver a false para evitar conflictos en iOS.
   */
  useEffect(() => {
    if (selectedLocalIndex !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // <-- Cambiado a false
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 12,
          bounciness: 8,
          useNativeDriver: false, // <-- Cambiado a false
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: false, // <-- Cambiado a false
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [selectedLocalIndex, fadeAnim, slideAnim, scaleAnim]);

  /**
   * Obtiene ubicación actual o la del address
   */
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

        // Watch en tiempo real
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

  /**
   * Filtro de tiendas
   */
  const filterShops = useCallback(() => {
    const allShops = Array.isArray(shopsByCategory)
      ? shopsByCategory.filter((shop) => shop.orderIn)
      : Object.values(shopsByCategory).flat().filter((shop) => shop.orderIn);

    if (selectedTag) {
      return allShops.filter(
        (shop) => shop.tags && shop.tags.some((t) => t.id === selectedTag.id)
      );
    }
    return allShops;
  }, [selectedTag, shopsByCategory]);

  const filteredShops = useMemo(() => filterShops(), [filterShops]);

  /**
   * Cálculo de distancias con Distance Matrix API
   */
  useEffect(() => {
    const fetchDistances = async () => {
      if (!address) return;

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

            // Convertir a millas
            const distanceValueMiles = distanceValueKm * 0.621371;
            const distanceTextMiles = `${distanceValueMiles.toFixed(2)} mi`;

            // Ejemplo de filtro: solo guardamos si está dentro de 20 millas
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

    fetchDistances();
  }, [address, filteredShops]);

  /**
   * Obtener y setear todas las tags
   */
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

  /**
   * Manejo de markers y modal
   */
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

  /**
   * Manejo de tags
   */
  const handleTagPress = useCallback(
    (tag) => {
      // Si la tag actual está seleccionada, deseleccionamos
      const newSelectedTag = selectedTag && selectedTag.id === tag.id ? null : tag;
      setSelectedTag(newSelectedTag);
    },
    [selectedTag]
  );

  /**
   * Navegación entre tarjetas del modal
   */
  const handleNext = () => {
    if (selectedLocalIndex < filteredShops.length - 1) {
      const nextIndex = selectedLocalIndex + 1;
      setSelectedLocalIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  const handlePrevious = () => {
    if (selectedLocalIndex > 0) {
      const prevIndex = selectedLocalIndex - 1;
      setSelectedLocalIndex(prevIndex);
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };

  /**
   * Renderizado de rating
   */
  const renderRating = (rating) => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      <FontAwesome5 name="star" size={18} color="#FFD700" style={styles.starIcon} />
    </View>
  );

  /**
   * Abrir dirección en Google / Apple Maps
   */
  const openAddressInMaps = (shopAddress) => {
    const encodedAddress = encodeURIComponent(shopAddress);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;

    if (Platform.OS === 'ios') {
      Linking.openURL(appleMapsUrl);
    } else {
      Linking.openURL(googleMapsUrl);
    }
  };

  /**
   * Emojis opcionales para tags
   */
  const tagEmojis = {
    Pizza: '🍕',
    Burgers: '🍔',
    Sushi: '🍣',
    Vegan: '🥦',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabecera con BlurView (sin flecha de go back) */}
      <BlurView
        intensity={100}
        style={[
          styles.headerContainer,
          {
            marginTop: insets.top,
          },
        ]}
      >
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

      {/* Contenido principal: mapa o loaders */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={{ uri: 'https://lottiefiles.com/free-animation/map-QXiXmV9xvj' }}
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
            Permission to access location was denied. Please enable location services to use the app.
          </Text>
        </View>
      ) : (
        region && (
          <MapView
            style={styles.map}
            region={region}
            // Para Android forzar Google
            {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
          >
            {/* Marker del usuario */}
            {marker && (
              <Marker coordinate={marker}>
                <View style={styles.userMarker}>
                  <FontAwesome5 name="map-pin" size={24} color="#4A90E2" />
                </View>
              </Marker>
            )}

            {/* Markers de las tiendas */}
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
                          scale:
                            selectedLocalIndex === index
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

      {/* Modal para info de la tienda seleccionada */}
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
                      <Text
                        style={styles.modalAddress}
                        onPress={() => openAddressInMaps(item.address)}
                      >
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
                /**
                 * Evita crash en iOS cuando no puede hacer scroll al index inicial
                 */
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToIndex({
                      index: info.index,
                      animated: true,
                    });
                  }, 500);
                }}
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

export default MapViewComponent;

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
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 11,
    elevation: 11,
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
    zIndex: 2000, // Asegura que esté por encima en iOS
  },
  modalContent: {
    width,
    height: height * 0.6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: '35%',
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
