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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current

  // When 'selectedLocalIndex' changes, we trigger the animations
  useEffect(() => {
    if (selectedLocalIndex !== null) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
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

  // Get user location or address location
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

  // Filter shops based on selected tag
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

  // Calculate distances in miles (optional)
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
            // Only save if it's less than 20 miles (example)
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

  // Get all tags
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
      {/* Header with tags */}
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

      {/* Loader or Permission denied */}
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
            // If you want to force Google Maps on iOS, add:
            // provider={PROVIDER_GOOGLE}
          >
            {/* User marker */}
            {marker && (
              <Marker
                coordinate={marker}
                // To not show native callouts on iOS:
                calloutEnabled={false}
              >
                <View style={styles.userMarker}>
                  <FontAwesome5 name="map-pin" size={24} color="#4A90E2" />
                </View>
              </Marker>
            )}

            {/* Shop markers */}
            {filteredShops.map((shop, index) => (
              <Marker
                key={shop.id}
                coordinate={{ latitude: shop.lat, longitude: shop.lng }}
                onPress={() => handleMarkerPress(shop, index)}
                calloutEnabled={false} // Disable native callout
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

      {/* Cards when selecting a Marker - REDESIGNED AND ADJUSTED */}
      {selectedLocalIndex !== null && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
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
                <View style={styles.modernCardContainer}>
                  {/* Image with overlay for better contrast */}
                  <View style={styles.modernImageWrapper}>
                    <Image
                      source={{ uri: item.placeImage }}
                      style={styles.modernCardImage}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay} />
                    
                    {/* Close button */}
                    <TouchableOpacity 
                      style={styles.modernCloseButton} 
                      onPress={handleCloseModal}
                    
                      onPress={handleCloseModal}
                    >
                      <FontAwesome5 name="times" size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    {/* Discount on image */}
                    {item.discountPercentage && (
                      <View style={styles.modernDiscountBadge}>
                        <Text style={styles.modernDiscountText}>
                          {item.discountPercentage}% OFF
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Card content */}
                  <View style={styles.modernCardContent}>
                    {/* Title and rating on the same line */}
                    <View style={styles.modernTitleRow}>
                      <Text style={styles.modernCardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      
                      {item.rating && (
                        <View style={styles.modernRatingContainer}>
                          <Text style={styles.modernRatingText}>{item.rating.toFixed(1)}</Text>
                          <FontAwesome5 name="star" size={12} color="#FF9900" />
                        </View>
                      )}
                    </View>
                    
                    {/* Address with icon */}
                    <TouchableOpacity 
                      style={styles.modernAddressRow}
                      onPress={() => openAddressInMaps(item.address)}
                    >
                      <FontAwesome5 name="map-marker-alt" size={12} color="#FF9900" />
                      <Text style={styles.modernAddressText} numberOfLines={2}>
                        {item.address}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Distance and button on the same line */}
                    <View style={styles.modernBottomRow}>
                      {distances[item.id] && (
                        <View style={styles.modernDistanceContainer}>
                          <FontAwesome5 name="walking" size={12} color="#666" />
                          <Text style={styles.modernDistanceText}>{distances[item.id]}</Text>
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={styles.modernViewButton}
                        onPress={() => handleNavigateToShop(item)}
                      >
                        <Text style={styles.modernViewButtonText}>View Store</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
          
          {/* Navigation arrows outside the card */}
          {selectedLocalIndex > 0 && (
            <TouchableOpacity
              style={[styles.modernNavButton, styles.modernLeftButton]}
              onPress={handlePrevious}
            >
              <FontAwesome5 name="chevron-left" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          {selectedLocalIndex < filteredShops.length - 1 && (
            <TouchableOpacity
              style={[styles.modernNavButton, styles.modernRightButton]}
              onPress={handleNext}
            >
              <FontAwesome5 name="chevron-right" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    flex: 1
  },

  // Header with tags
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
    backgroundColor: '#FF9900' // Primary color
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

  // User marker
  userMarker: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Shop markers
  shopMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  shopMarkerImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderColor: '#FF9900', // Primary color
    borderWidth: 2
  },
  defaultMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FF9900', // Primary color
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  markerDiscountBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF9900', // Primary color
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

  // Animated card container
  cardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 180 : 100, // Adjusted for iOS
    zIndex: 10
  },
  pageContainer: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // REDESIGNED CARD - More minimalist and modern
  modernCardContainer: {
    width: CARD_WIDTH,
    height: 230, // Increased height to fit all content
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  modernImageWrapper: {
    width: '100%',
    height: 100,
    position: 'relative'
  },
  modernCardImage: {
    width: '100%',
    height: '100%'
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  modernCloseButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  modernDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF9900',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  modernDiscountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  modernCardContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between'
  },
  modernTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modernCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  modernRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  modernRatingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4
  },
  modernAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6
  },
  modernAddressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16
  },
  modernBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  modernDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modernDistanceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  modernViewButton: {
    backgroundColor: '#FF9900',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  modernViewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  
  // Modern navigation buttons
  modernNavButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modernLeftButton: {
    left: 10
  },
  modernRightButton: {
    right: 10
  }
})