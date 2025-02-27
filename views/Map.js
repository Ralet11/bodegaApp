import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  Animated,
  Linking,
  Platform
} from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useDispatch, useSelector } from 'react-redux'
import * as Location from 'expo-location'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { FontAwesome5 } from '@expo/vector-icons'
import isEqual from 'lodash.isequal'
import Axios from 'react-native-axios'
import { BlurView } from 'expo-blur'
import LottieView from 'lottie-react-native'

const { width, height } = Dimensions.get('window')
// Definimos el ancho de la tarjeta
const CARD_WIDTH = width - 60
const GOOGLE_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc'

export default function MapViewComponent() {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const address = useSelector(state => state?.user?.address?.formatted_address) || ''
  const shopsByCategory = useSelector(
    state => state?.setUp?.shopsDiscounts || {},
    isEqual
  )

  const [region, setRegion] = useState(null)
  const [marker, setMarker] = useState(null)
  const [selectedLocalIndex, setSelectedLocalIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState(null)
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [distances, setDistances] = useState({})

  const flatListRef = useRef()

  // Animaciones
  // fadeAnim para opacidad, slideAnim para mover la card verticalmente, scaleAnim para "escala".
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current

  // Al cambiar 'selectedLocalIndex', lanzamos las animaciones
  useEffect(() => {
    if (selectedLocalIndex !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        // Aquí “slideAnim” pasa de 0 a 1
        Animated.spring(slideAnim, {
          toValue: 1,
          speed: 12,
          bounciness: 8,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        // Al cerrar, regresamos la card hacia abajo (slideAnim vuelve a 0)
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true
        })
      ]).start()
    }
  }, [selectedLocalIndex, fadeAnim, slideAnim, scaleAnim])

  // Obtener ubicación del usuario o de su dirección
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') {
          setLoading(false)
          setLocationPermissionDenied(true)
          return
        }
        let location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121
        })
        setMarker({ latitude, longitude })

        // Watch location
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10
          },
          newLocation => {
            const { latitude, longitude } = newLocation.coords
            setRegion(prevRegion => ({
              ...prevRegion,
              latitude,
              longitude
            }))
            setMarker({ latitude, longitude })
          }
        )
      } catch (error) {
        console.error('Error fetching location:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchAddressLocation = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
          )}&key=${GOOGLE_API_KEY}`
        )
        const json = await response.json()
        if (json.results.length > 0) {
          const location = json.results[0].geometry.location
          setRegion({
            latitude: location.lat,
            longitude: location.lng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121
          })
          setMarker({
            latitude: location.lat,
            longitude: location.lng
          })
        }
      } catch (error) {
        console.error('Error fetching address location:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!address) {
      fetchLocation()
    } else {
      fetchAddressLocation()
    }
  }, [address])

  // Filtrar shops según el tag seleccionado
  const filterShops = useCallback(() => {
    const allShops = Array.isArray(shopsByCategory)
      ? shopsByCategory.filter(shop => shop.orderIn)
      : Object.values(shopsByCategory).flat().filter(shop => shop.orderIn)

    if (selectedTag) {
      return allShops.filter(
        shop => shop.tags && shop.tags.some(t => t.id === selectedTag.id)
      )
    }
    return allShops
  }, [selectedTag, shopsByCategory])

  const filteredShops = useMemo(() => filterShops(), [filterShops])

  // Calcular distancias en millas (opcional)
  useEffect(() => {
    const fetchDistances = async () => {
      if (!address) return
      const newDistances = {}
      for (const shop of filteredShops) {
        if (shop.address) {
          try {
            const response = await Axios.get(
              `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
                address
              )}&destinations=${encodeURIComponent(shop.address)}&key=${GOOGLE_API_KEY}`
            )
            const distanceValueKm =
              response.data.rows[0].elements[0].distance.value / 1000
            const distanceValueMiles = distanceValueKm * 0.621371
            const distanceTextMiles = `${distanceValueMiles.toFixed(2)} mi`
            // Solo guardamos si está a menos de 20 millas (ejemplo)
            if (distanceValueMiles <= 20) {
              newDistances[shop.id] = distanceTextMiles
            }
          } catch (error) {
            console.error('Error fetching distance:', error)
          }
        }
      }
      setDistances(newDistances)
    }
    fetchDistances()
  }, [address, filteredShops])

  // Obtener todos los tags
  useEffect(() => {
    const shopsArray = Array.isArray(shopsByCategory)
      ? shopsByCategory
      : Object.values(shopsByCategory).flat()

    const tagsMap = new Map()
    shopsArray.forEach(shop => {
      if (shop.tags) {
        shop.tags.forEach(tag => {
          if (!tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, tag)
          }
        })
      }
    })
    const tagsArray = Array.from(tagsMap.values())
    setAllTags(tagsArray)
  }, [shopsByCategory])

  // Handlers
  const handleMarkerPress = useCallback((_shop, index) => {
    setSelectedLocalIndex(index)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedLocalIndex(null)
  }, [])

  const handleNavigateToShop = useCallback(
    shop => {
      navigation.navigate('Shop', { shop })
      setSelectedLocalIndex(null)
    },
    [navigation]
  )

  const handleTagPress = useCallback(tag => {
    setSelectedTag(prev => (prev?.id === tag.id ? null : tag))
  }, [])

  const handleNext = () => {
    if (selectedLocalIndex < filteredShops.length - 1) {
      const nextIndex = selectedLocalIndex + 1
      setSelectedLocalIndex(nextIndex)
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })
    }
  }

  const handlePrevious = () => {
    if (selectedLocalIndex > 0) {
      const prevIndex = selectedLocalIndex - 1
      setSelectedLocalIndex(prevIndex)
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true })
    }
  }

  const openAddressInMaps = shopAddress => {
    const encodedAddress = encodeURIComponent(shopAddress)
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`
    if (Platform.OS === 'ios') {
      Linking.openURL(appleMapsUrl)
    } else {
      Linking.openURL(googleMapsUrl)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado con tags */}
      <BlurView intensity={100} style={[styles.headerContainer, { marginTop: insets.top }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollView}
        >
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagButton,
                selectedTag && selectedTag.id === tag.id && styles.selectedTagButton
              ]}
              onPress={() => handleTagPress(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTag && selectedTag.id === tag.id && styles.selectedTagText
                ]}
              >
                {tag.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>

      {/* Loader o Permiso denegado */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_X7WDCg.json' }}
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
            Location access is required to use this feature. Please enable location services.
          </Text>
        </View>
      ) : (
        region && (
          <MapView
            style={styles.map}
            region={region}
            // Si quieres forzar Google Maps en iOS, añade:
            // provider={PROVIDER_GOOGLE}
          >
            {/* Marker del usuario */}
            {marker && (
              <Marker
                coordinate={marker}
                // Para no mostrar callouts nativos en iOS:
                calloutEnabled={false}
              >
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
                calloutEnabled={false} // Desactiva el callout nativo
              >
                <View style={styles.shopMarkerContainer}>
                  {shop.logo ? (
                    <Image source={{ uri: shop.logo }} style={styles.shopMarkerImage} />
                  ) : (
                    <View style={styles.defaultMarker}>
                      <FontAwesome5 name="store" size={18} color="#fff" />
                    </View>
                  )}
                  {shop.discountPercentage && (
                    <View style={styles.markerDiscountBadge}>
                      <Text style={styles.markerDiscountBadgeText}>
                        {shop.discountPercentage}%
                      </Text>
                    </View>
                  )}
                  {shop.rating && (
                    <View style={styles.markerRatingBadge}>
                      <Text style={styles.markerRatingText}>{shop.rating.toFixed(1)}</Text>
                      <FontAwesome5 name="star" size={12} color="#FFD700" />
                    </View>
                  )}
                </View>
              </Marker>
            ))}
          </MapView>
        )
      )}

      {/* Cards al seleccionar un Marker */}
      {selectedLocalIndex !== null && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
                // slideAnim va de 0 (abajo) a 1 (arriba).
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0]
                  })
                },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={filteredShops}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.pageContainer}>
                <View style={styles.newCardContainer}>
                  {/* Imagen */}
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.placeImage }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                    {item.discountPercentage && (
                      <View style={styles.cardDiscountBadge}>
                        <Text style={styles.cardDiscountBadgeText}>
                          Hasta {item.discountPercentage}% OFF
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Info de la tienda */}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>

                    <View style={styles.cardDetails}>
                      {/* Rating */}
                      {item.rating && (
                        <View style={styles.ratingContainer}>
                          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                          <FontAwesome5 name="star" size={14} color="#FFD700" />
                        </View>
                      )}

                      {/* Distancia */}
                      {distances[item.id] && (
                        <View style={styles.distanceContainer}>
                          <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
                          <Text style={styles.distanceText}>{distances[item.id]}</Text>
                        </View>
                      )}
                    </View>

                    {/* Dirección clickeable */}
                    <Text
                      style={styles.address}
                      onPress={() => openAddressInMaps(item.address)}
                    >
                      {item.address}
                    </Text>

                    {/* Botón para ir a la tienda */}
                    <TouchableOpacity
                      style={styles.viewStoreButton}
                      onPress={() => handleNavigateToShop(item)}
                    >
                      <Text style={styles.viewStoreText}>Ver tienda</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Botón de cerrar */}
                  <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                    <FontAwesome5 name="times" size={20} color="#fff" />
                  </TouchableOpacity>

                  {/* Flechas de navegación */}
                  {selectedLocalIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.leftButton]}
                      onPress={handlePrevious}
                    >
                      <FontAwesome5 name="chevron-left" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                  {selectedLocalIndex < filteredShops.length - 1 && (
                    <TouchableOpacity
                      style={[styles.navButton, styles.rightButton]}
                      onPress={handleNext}
                    >
                      <FontAwesome5 name="chevron-right" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
            initialScrollIndex={selectedLocalIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index
            })}
            onScrollToIndexFailed={info => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true })
              }, 500)
            }}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    flex: 1
  },

  // Encabezado con tags
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  tagsScrollView: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10
  },
  selectedTagButton: {
    backgroundColor: '#007AFF'
  },
  tagText: {
    fontSize: 14,
    color: '#333'
  },
  selectedTagText: {
    color: '#fff'
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  lottieAnimation: {
    width: 200,
    height: 200
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  permissionDeniedText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20
  },

  // Marker del usuario
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Marker de las tiendas
  shopMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  shopMarkerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: '#4A90E2',
    borderWidth: 2
  },
  defaultMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  markerDiscountBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF3B30',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  markerDiscountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  markerRatingBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1
  },
  markerRatingText: {
    marginRight: 2,
    fontSize: 12,
    color: '#333',
    fontWeight: '600'
  },

  // Contenedor animado de la tarjeta
  cardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Ubicamos la tarjeta abajo y la subimos por animación
    bottom: 120,
    zIndex: 10
  },

  pageContainer: {
    width: width, // Cada ítem/página ocupa el ancho total
    justifyContent: 'center',
    alignItems: 'center'
  },

  newCardContainer: {
    width: CARD_WIDTH,
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  cardDiscountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 2
  },
  cardDiscountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardInfo: {
    padding: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  ratingText: {
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  address: {
    fontSize: 13,
    color: '#555',
    marginTop: 6,
    textDecorationLine: 'underline'
  },
  viewStoreButton: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center'
  },
  viewStoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },

  // Botón para cerrar la card
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Flechas de navegación
  navButton: {
    position: 'absolute',
    top: '45%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  leftButton: {
    left: 0
  },
  rightButton: {
    right: 0
  }
})
