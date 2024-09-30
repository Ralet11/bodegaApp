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
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import isEqual from 'lodash.isequal';

const { width, height } = Dimensions.get('window');

const GOOGLE_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';


const MapViewComponent = () => {
  const dispatch = useDispatch();
  const address = useSelector((state) => state?.user?.address?.formatted_address) || '';

  // Usamos isEqual para evitar re-renderizados innecesarios
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

        // Configurar el listener de ubicación
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

  // Extraer todas las etiquetas de las tiendas y eliminar duplicados
  useEffect(() => {
    console.log('shopsByCategory:', shopsByCategory); // Para depuración
    const shopsArray = Array.isArray(shopsByCategory)
      ? shopsByCategory.flat()
      : Object.values(shopsByCategory).flat();
    console.log('shopsArray:', shopsArray); // Para depuración
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
    console.log('Tags extraídos:', tagsArray); // Para depuración
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FontAwesome key={i} name="star" size={20} color="#ffcc00" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FontAwesome key={i} name="star-half-full" size={20} color="#ffcc00" />);
      } else {
        stars.push(<FontAwesome key={i} name="star-o" size={20} color="#ffcc00" />);
      }
    }
    return stars;
  };

  // Mapear emojis a las categorías
  const tagEmojis = {
    Pizza: '🍕',
    Burgers: '🍔',
    Sushi: '🍣',
    Vegan: '🥦',
    // Agrega más categorías y emojis según sea necesario
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Contenedor del header con el botón Go Back y los filtros */}
      <View style={styles.headerContainer}>
        {/* Botón Go Back */}
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Contenedor de etiquetas */}
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
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#008080" />
        </View>
      ) : locationPermissionDenied ? (
        <View style={styles.permissionDeniedContainer}>
          <Text style={styles.permissionDeniedText}>
            Permiso para acceder a la ubicación denegado. Por favor, habilita los servicios de
            ubicación para usar la aplicación.
          </Text>
        </View>
      ) : (
        region && (
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
                    <Image source={{ uri: shop.logo }} style={styles.markerImage} />
                  </View>
                </View>
                <Callout>
                  <Text>{shop.name}</Text>
                </Callout>
              </Marker>
            ))}
          </MapView>
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
                renderItem={({ item }) => (
                  <View style={styles.modalContent}>
                    <Image source={{ uri: item.placeImage }} style={styles.modalImage} />
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                    <Text style={styles.modalAddress}>{item.address}</Text>
                    <TouchableOpacity
                      style={styles.navigateButton}
                      onPress={() => handleNavigateToShop(item)}
                    >
                      <Text style={styles.navigateButtonText}>Ver Detalles</Text>
                    </TouchableOpacity>
                  </View>
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
    zIndex: 1,
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
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 11,
    elevation: 11,
  },
  goBackButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  tagsScrollView: {
    flexGrow: 1,
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedTagButton: {
    backgroundColor: '#ffcc00',
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  selectedTagText: {
    color: '#000',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: width * 0.1,
    marginTop: 100,
  },
  modalImage: {
    width: '100%',
    height: 200,
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
    textAlign: 'center',
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
  },
  navigateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
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
    transform: [{ translateY: -25 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  arrowRight: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -25 }],
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
