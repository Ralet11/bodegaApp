import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  BackHandler,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  Dimensions,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  setAuxShops,
  setShopsDiscounts,
  setUserDiscounts,
} from '../redux/slices/setUp.slice';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';
import { setAddress, setLocation } from '../redux/slices/user.slice';
import SkeletonLoader from '../components/SkeletonLoader';
import DiscountShopScroll from '../components/DiscountShopScroll';
import DiscountProductsScroll from '../components/DiscountProductScroll';
import { clearCart } from '../redux/slices/cart.slice';
import * as Location from 'expo-location';
import DeliveryModeToggle from '../components/DeliveryModeToggle';

const { width } = Dimensions.get('window');

const DashboardDiscount = () => {
  const scheme = useColorScheme();
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [filteredShopsByTags, setFilteredShopsByTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('Dine-in');
  const [TemporalProducts, setTemporalProducts] = useState([]);

  // Redux
  const address = useSelector((state) => state?.user?.address?.formatted_address);
  const location = useSelector((state) => state?.user?.location);
  const addresses = useSelector((state) => state?.user?.addresses);
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const auxShops = useSelector((state) => state?.setUp?.auxShops);
  const cart = useSelector((state) => state.cart.items);
  const auxCart = useSelector((state) => state?.setUp?.auxCart);

  const [allTags, setAllTags] = useState([]);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Mapeo: 'Dine-in' -> 0, 'Pickup' -> 1
  const orderTypeParam = deliveryMode === 'Dine-in' ? 0 : deliveryMode === 'Pickup' ? 1 : null;

  // Limpiar carrito cuando cambia auxCart
  useEffect(() => {
    dispatch(clearCart());
  }, [auxCart, dispatch]);

  // Control del botón atrás en Android y bloqueo de navegación en iOS
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      let removeBeforeRemove;
      if (Platform.OS === 'ios') {
        removeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
          // Permitir acciones de reseteo (por ejemplo, logout) y bloquear otras navegaciones
          if (e.data.action.type === 'RESET') {
            return;
          }
          e.preventDefault();
        });
      }

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        if (removeBeforeRemove) removeBeforeRemove();
      };
    }, [navigation])
  );

  // Limpiar el searchQuery cuando entramos a la pantalla
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  // Extraer todos los tags únicos que hay en las shops
  const extractTags = (shops) => {
    const tags = new Set();
    Object.keys(shops).forEach((catId) => {
      shops[catId].forEach((shop) => {
        if (shop.tags && Array.isArray(shop.tags)) {
          shop.tags.forEach((tag) => tags.add(JSON.stringify(tag)));
        }
      });
    });
    const uniqueTagsArray = Array.from(tags).map((t) => JSON.parse(t));
    setAllTags(uniqueTagsArray);
  };

  // Obtener las tiendas
  const fetchShops = async () => {
    if (!token) return;
    try {
      const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCatDiscount`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShopsByCategory(response.data);
      extractTags(response.data);
      filterShopsByTags(response.data, deliveryMode);
      setLoading(false);
      dispatch(setShopsDiscounts(response.data));
    } catch (error) {
      console.error('Error fetching shops:', error);
      setLoading(false);
    }
  };

  const fetchTemporalProducts = async () => {
    if (!token) return;
    try {
      const response = await Axios.get(`${API_URL}/api/local/app/getTemporalProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTemporalProducts(response.data);
      console.log(response.data, "response data")
    } catch (error) {
      console.error('Error fetching temporal products:', error);
      setLoading(false);
    }
  };

  console.log(TemporalProducts, "temporalProd");
  console.log(TemporalProducts[0]?.discountSchedule, "temporalProd");

  // Obtener ubicación actual
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed.', [{ text: 'OK' }]);
        setLoading(false);
        return;
      }
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        Alert.alert('Location Services Disabled', 'Please enable location services.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Location.enableNetworkProviderAsync();
            },
          },
        ]);
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = loc.coords;
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const formatted_address = `${geocode[0].street || ''} ${geocode[0].name || ''}, ${geocode[0].city || ''}, ${geocode[0].region || ''}, ${geocode[0].postalCode || ''}, ${geocode[0].country || ''}`;
        const currentAddress = {
          id: 'current_location',
          name: 'Current Location',
          formatted_address,
          latitude,
          longitude,
        };
        dispatch(setAddress(currentAddress));
        dispatch(setLocation(currentAddress));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get current location.', [{ text: 'OK' }]);
      setLoading(false);
    }
  };

  // Listener para reintentar obtener ubicación cuando la app se vuelve activa
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && token && !address) {
        getCurrentLocation();
      }
    });
    return () => subscription.remove();
  }, [token, address]);

  // Obtener descuentos del usuario


  // Llamar a fetchShops + fetchTemporalProducts + getCurrentLocation cuando tengamos token
  useEffect(() => {
    if (token) {
      fetchShops();
      fetchTemporalProducts();
      if (!address) {
        getCurrentLocation();
      }
    }
  }, [auxShops, token]);

  const changeAddress = () => {
    setAddressModalVisible(true);
  };

  const handleAddressSelect = (selectedAddress) => {
    dispatch(setAddress(selectedAddress));
    setAddressModalVisible(false);
  };

  // Ir a la tienda
  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop, orderTypeParam });
  };

  // Ir a la pantalla de categoría
  const handleCategoryPress = (selectedTag) => {
    navigation.navigate('CategoryShops', { selectedTag, allTags });
  };

  // Drawer lateral
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  const handleNavigate = (screen) => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };

  // Filtrar shops por nombre usando searchQuery
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const filteredShops = [];
      Object.keys(filteredShopsByTags).forEach((tagName) => {
        const shopsFound = filteredShopsByTags[tagName].filter((shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (shopsFound.length) filteredShops.push(...shopsFound);
      });
      navigation.navigate('CategoryShops', {
        filteredShops,
        searchQuery,
        selectedTag: null,
        allTags,
      });
    }
  };

  // Filtrar tiendas según "Dine-in" o "Pickup"
  const filterShopsByTags = (shops, mode) => {
    const currentDateTime = new Date();
    const currentDay = currentDateTime
      .toLocaleString('en-US', { weekday: 'short' })
      .toLowerCase();
    const currentTime = currentDateTime.toTimeString().slice(0, 8);

    const filtered = {};
    Object.keys(shops).forEach((catId) => {
      shops[catId].forEach((shop) => {
        let isModeMatch = false;
        if (mode === 'Dine-in') {
          isModeMatch = shop.orderIn;
        } else if (mode === 'Pickup') {
          isModeMatch = shop.pickUp;
        }
        const isOpen = shop.openingHours.some((hour) => {
          return (
            hour.day === currentDay &&
            hour.open_hour <= currentTime &&
            hour.close_hour >= currentTime
          );
        });
        if (isModeMatch && isOpen) {
          shop.tags.forEach((tag) => {
            if (!filtered[tag.name]) {
              filtered[tag.name] = [];
            }
            filtered[tag.name].push(shop);
          });
        }
      });
    });
    setFilteredShopsByTags(filtered);
  };

  // Verificar si no hay tiendas disponibles
  const noShopsAvailable = !Object.keys(filteredShopsByTags).some(
    (tagName) => filteredShopsByTags[tagName].length > 0
  );

  // Loading
  if (loading || !token) {
    return <SkeletonLoader />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header con dirección y modo de entrega */}
      <View style={styles.header}>
        <View style={styles.addressToggleContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Addresses')}
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          >
            <FontAwesome
              name="map-marker"
              size={18}
              color="#333"
              style={{ marginRight: 5 }}
            />
            <Text
              style={[styles.addressText, { flexShrink: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {address}
            </Text>
          </TouchableOpacity>
          <View style={{ flexShrink: 0, marginLeft: 10 }}>
            <DeliveryModeToggle deliveryMode={deliveryMode} onToggle={setDeliveryMode} />
          </View>
        </View>

        {/* Barra de búsqueda + botón drawer */}
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={toggleDrawer} style={[styles.iconButton, styles.iconButtonFix]}>
            <FontAwesome name="bars" size={20} color="#333" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, foods..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Slider de promociones */}
        <PromoSlider />

        {/* Sección de temporal products con descuento activo */}
        
        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#333' }}>
            What are you looking for today?
          </Text>
        </View>

        {/* Tags / Categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={styles.category}
              onPress={() => handleCategoryPress(tag)}
            >
              <Image
                source={{
                  uri:
                    tag?.img ||
                    'https://res.cloudinary.com/doqyrz0sg/image/upload/v1628580001/placeholder.png',
                }}
                style={styles.categoryImage}
              />
              <Text style={styles.categoryText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
        
          <DiscountProductsScroll products={TemporalProducts} />
        </View>


        {/* Lista de shops o mensaje de no disponible */}
        {noShopsAvailable ? (
          <View style={styles.noShopsContainer}>
            <View style={styles.noShopsCard}>
              <View style={styles.mapMarkerIcon}>
                <FontAwesome name="map-marker" size={24} color="#333" />
              </View>
              <Text style={styles.noShopsTitle}>Oops! No shops nearby</Text>
              <Text style={styles.noShopsDesc}>
                We couldn't find any shops in your area
              </Text>
              <View style={styles.separatorLine} />
              <Text style={styles.noShopsHint}>
                We're constantly expanding our network. Check back soon!
              </Text>
              <View style={styles.noShopsImageContainer}>
                <Image
                  source={{
                    uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1720400961/c0e3cfe8-b839-496f-b6af-9e9f76d7360c_dev8hm.webp',
                  }}
                  style={styles.noShopsImage}
                />
              </View>
            </View>
          </View>
        ) : (
          Object.keys(filteredShopsByTags).map(
            (name) =>
              filteredShopsByTags[name].length > 0 && (
                <DiscountShopScroll
                  key={name}
                  title={name}
                  items={filteredShopsByTags[name]}
                  scheme={scheme}
                  handleItemPress={handleShopPress}
                  allTags={allTags}
                />
              )
          )
        )}
      </ScrollView>

      {/* Drawer de cuenta */}
      <AccountDrawer
        visible={drawerVisible}
        onClose={toggleDrawer}
        onNavigate={handleNavigate}
        scheme={scheme}
        user={user}
      />

      {/* Modal de direcciones */}
      <Modal
        animationType="slide"
        transparent
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setAddressModalVisible(false)}
              style={styles.closeButton}
            >
              <FontAwesome name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Your Address</Text>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAddressSelect(item)}
                  style={styles.addressItem}
                >
                  <Text style={styles.addressName}>{item.name}</Text>
                  <Text style={styles.addressTextModal}>{item.formatted_address}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate('SetAddressScreen');
              }}
            >
              <Text style={styles.addButtonText}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingVertical: 5,
    backgroundColor: '#fff',
  },
  addressToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
  },
  iconButton: {
    padding: 6,
  },
  iconButtonFix: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#333',
  },
  category: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  noShopsContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  noShopsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
    width: '90%',
    maxWidth: 300,
  },
  mapMarkerIcon: {
    backgroundColor: '#FFF0F0',
    borderRadius: 50,
    padding: 10,
    marginBottom: 15,
  },
  noShopsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noShopsDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  separatorLine: {
    width: 50,
    height: 3,
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    marginBottom: 8,
  },
  noShopsHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  noShopsImageContainer: {
    width: '100%',
    height: 100,
    overflow: 'hidden',
    borderRadius: 20,
  },
  noShopsImage: {
    width: '50%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  addressItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  addressName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  addressTextModal: {
    fontSize: 12,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});

export default DashboardDiscount;
