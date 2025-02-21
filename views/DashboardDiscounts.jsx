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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setAuxShops, setShopsDiscounts, setUserDiscounts } from '../redux/slices/setUp.slice';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';
import { setAddress } from '../redux/slices/user.slice';
import SkeletonLoader from '../components/SkeletonLoader';
import { lightTheme } from '../components/themes';
import socketIOClient from 'socket.io-client';
import DiscountShopScroll from '../components/DiscountShopScroll';
import { clearCart } from '../redux/slices/cart.slice';
import * as Location from 'expo-location';
import DeliveryModeToggle from '../components/DeliveryModeToggle';

const DashboardDiscount = () => {
  const scheme = useColorScheme();
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [filteredShopsByTags, setFilteredShopsByTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('Dine-in');
  const categories = useSelector((state) => state?.setUp?.categories) || [];
  const address = useSelector((state) => state?.user?.address?.formatted_address);
  const addresses = useSelector((state) => state?.user?.addresses);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const auxShops = useSelector((state) => state?.setUp?.auxShops);
  const [allTags, setAllTags] = useState([]);
  const cart = useSelector((state) => state.cart.items);
  const auxCart = useSelector((state) => state?.setUp?.auxCart);
  // Mapea el modo de entrega a un número para otras pantallas
  const orderTypeParam = deliveryMode === 'Dine-in' ? 0 : deliveryMode === 'Pickup' ? 1 : null;

  useEffect(() => {
    // Limpia el carrito al montar/actualizar si así lo requieres
    dispatch(clearCart());
  }, [auxCart]);

  // BLOCK SWIPE BACK: Al enfocar la pantalla, evitamos cualquier "back" en iOS
  useFocusEffect(
    useCallback(() => {
      // Bloqueamos el botón "back" de Android.
      const onBackPress = () => true;
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Bloqueamos el "swipe back" en iOS.
      let removeBeforeRemove;
      if (Platform.OS === 'ios') {
        removeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
          // Evitar la navegación hacia atrás (gesto o botón)
          e.preventDefault();
        });
      }

      // Al salir de la pantalla, quitamos los listeners
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        if (removeBeforeRemove) removeBeforeRemove();
      };
    }, [navigation])
  );

  useFocusEffect(
    useCallback(() => {
      // Limpia el query de búsqueda cuando entras a esta pantalla
      setSearchQuery('');
    }, [])
  );

  // Función para extraer todas las tags únicas de los comercios
  const extractTags = (shops) => {
    const tags = new Set();
    Object.keys(shops).forEach((categoryId) => {
      shops[categoryId].forEach((shop) => {
        if (shop.tags && Array.isArray(shop.tags)) {
          shop.tags.forEach((tag) => tags.add(JSON.stringify(tag)));
        }
      });
    });
    const uniqueTagsArray = Array.from(tags).map((tag) => JSON.parse(tag));
    setAllTags(uniqueTagsArray);
  };

  useEffect(() => {
    // Configura socket para sincronizar tiendas
    const socket = socketIOClient(`${API_URL}`);
    const syncShops = () => {
      dispatch(setAuxShops());
    };
    socket.on('syncShops', syncShops);

    return () => {
      socket.off('syncShops');
      socket.disconnect();
    };
  }, [dispatch]);

  const fetchShops = async () => {
    if (!token) {
      console.warn('Token not available');
      return;
    }
    try {
      const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCatDiscount`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);
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

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to set your address.', [{ text: 'OK' }]);
        return;
      }
      const locationEnabled = await Location.hasServicesEnabledAsync();
      if (!locationEnabled) {
        Alert.alert('Location Services Disabled', 'Please enable location services to continue.', [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Location.enableNetworkProviderAsync();
            },
          },
        ]);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = location.coords;
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const formatted_address = `${geocode[0].street || ''} ${
          geocode[0].name || ''
        }, ${geocode[0].city || ''}, ${geocode[0].region || ''}, ${
          geocode[0].postalCode || ''
        }, ${geocode[0].country || ''}`;
        const currentAddress = {
          id: 'current_location',
          name: 'Current Location',
          formatted_address: formatted_address,
          latitude,
          longitude,
        };
        dispatch(setAddress(currentAddress));
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to get current location. Please try again.', [{ text: 'OK' }]);
    }
  };

  // Trae los descuentos del usuario
  useEffect(() => {
    if (user?.id && token) {
      const fetchUserDiscounts = async () => {
        try {
          const response = await Axios.get(`${API_URL}/api/discounts/userDiscount/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          dispatch(setUserDiscounts(response.data));
        } catch (error) {
          console.error('Error fetching user discounts:', error);
        }
      };
      fetchUserDiscounts();
    }
  }, [user?.id, token, dispatch]);

  useEffect(() => {
    if (token) {
      fetchShops();
      if (!address) {
        getCurrentLocation();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auxShops, token]);

  // Abrir/cerrar el modal de direcciones
  const changeAddress = () => {
    setAddressModalVisible(true);
  };

  const handleAddressSelect = (selectedAddress) => {
    dispatch(setAddress(selectedAddress));
    setAddressModalVisible(false);
  };

  // Navegar a la pantalla de la tienda
  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop, orderTypeParam });
  };

  // Navegar a la pantalla de tiendas por categoría (tag)
  const handleCategoryPress = (selectedTag) => {
    navigation.navigate('CategoryShops', { selectedTag, allTags });
  };

  // Abrir/cerrar el drawer
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleNavigate = (screen) => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };

  // Buscador
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const filteredShops = [];
      Object.keys(filteredShopsByTags).forEach((tagName) => {
        const shops = filteredShopsByTags[tagName].filter((shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (shops.length > 0) {
          filteredShops.push(...shops);
        }
      });
      navigation.navigate('CategoryShops', {
        filteredShops,
        searchQuery,
        selectedTag: null,
        allTags,
      });
    }
  };

  // Cambio del modo de entrega (Dine-in / Pickup)
  const handleToggle = (mode) => {
    setDeliveryMode(mode);
    filterShopsByTags(shopsByCategory, mode);
  };

  // Filtrar las tiendas según el modo, día y horario
  const filterShopsByTags = (shops, mode) => {
    const currentDateTime = new Date();
    const currentDay = currentDateTime.toLocaleString('en-US', {
      weekday: 'short',
    }).toLowerCase();
    const currentTime = currentDateTime.toTimeString().slice(0, 8);

    const filtered = {};
    Object.keys(shops).forEach((categoryId) => {
      shops[categoryId].forEach((shop) => {
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

  const noShopsAvailable = !Object.keys(filteredShopsByTags).some(
    (tagName) => filteredShopsByTags[tagName].length > 0
  );

  if (loading || !token) {
    return <SkeletonLoader />;
  }

  return (
    <SafeAreaView style={lightTheme.safeArea}>
      <View style={lightTheme.header}>
        <View style={styles.addressToggleContainer}>
          <View
            onPress={changeAddress}
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          >
            <FontAwesome
              name="map-marker"
              size={18}
              color={'#333'}
              style={{ marginRight: 5 }}
            />
            <Text style={lightTheme.addressText} numberOfLines={1} ellipsizeMode="tail">
              {address}
            </Text>
          </View>
          <DeliveryModeToggle deliveryMode={deliveryMode} onToggle={handleToggle} />
        </View>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={toggleDrawer}
            style={[lightTheme.iconButton, styles.iconButtonFix]}
          >
            <FontAwesome name="bars" size={20} color={'#333'} />
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

      <ScrollView contentContainerStyle={lightTheme.contentContainer}>
        <PromoSlider />
        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#333' }}>
            What are you looking for today?
          </Text>
        </View>

        {/* Listado de tags disponibles */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={lightTheme.category}
              onPress={() => handleCategoryPress(tag)}
            >
              <Image
                source={{
                  uri:
                    tag?.img ||
                    'https://res.cloudinary.com/doqyrz0sg/image/upload/v1628580001/placeholder.png',
                }}
                style={lightTheme.categoryImage}
              />
              <Text style={lightTheme.categoryText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Si no hay tiendas abiertas, se muestra un mensaje */}
        {noShopsAvailable ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#FFF',
              paddingHorizontal: 20,
              paddingVertical: 40,
            }}
          >
            <View
              style={{
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
              }}
            >
              <View
                style={{
                  backgroundColor: '#FFF0F0',
                  borderRadius: 50,
                  padding: 10,
                  marginBottom: 15,
                }}
              >
                <FontAwesome name="map-marker" size={24} color="#333" />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#333',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Oops! No shops nearby
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                We couldn't find any shops in your area
              </Text>
              <View
                style={{
                  width: 50,
                  height: 3,
                  backgroundColor: '#FF6B6B',
                  borderRadius: 2,
                  marginBottom: 8,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: '#888',
                  textAlign: 'center',
                  lineHeight: 16,
                  marginBottom: 12,
                }}
              >
                We're constantly expanding our network. Check back soon for
                exciting updates!
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 100,
                  overflow: 'hidden',
                  borderRadius: 20,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: 100,
                    overflow: 'hidden',
                    borderRadius: 20,
                  }}
                >
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1720400961/c0e3cfe8-b839-496f-b6af-9e9f76d7360c_dev8hm.webp',
                    }}
                    style={{
                      width: '50%',
                      height: '100%',
                      resizeMode: 'cover',
                      borderRadius: 20,
                      margin: 'auto',
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        ) : (
          // Si hay tiendas, renderizamos cada categoría
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

      {/* Drawer con menú de usuario */}
      <AccountDrawer
        visible={drawerVisible}
        onClose={toggleDrawer}
        onNavigate={handleNavigate}
        scheme={scheme}
        user={user}
      />

      {/* Modal de selección de dirección */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => {
          setAddressModalVisible(!addressModalVisible);
        }}
      >
        <View style={lightTheme.modalBackground}>
          <View style={lightTheme.modalContainer}>
            <TouchableOpacity
              onPress={() => setAddressModalVisible(false)}
              style={lightTheme.closeButton}
            >
              <FontAwesome name="close" size={24} color={'#000'} />
            </TouchableOpacity>
            <Text style={lightTheme.modalTitle}>Select Your Address</Text>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAddressSelect(item)}
                  style={lightTheme.addressItem}
                >
                  <Text style={lightTheme.addressName}>{item.name}</Text>
                  <Text style={lightTheme.addressTextModal}>
                    {item.formatted_address}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={lightTheme.separator} />}
              contentContainerStyle={lightTheme.flatListContent}
            />
            <TouchableOpacity
              style={lightTheme.addButton}
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate('SetAddressScreen');
              }}
            >
              <Text style={lightTheme.addButtonText}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addressToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 5,
    gap: 5,
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
  iconButtonFix: {
    height: 40, // Igual que el searchInput
    width: 40,  // Para que sea un cuadrado
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5, // Opcional, esquinas redondeadas
    backgroundColor: '#f0f0f0', // Opcional, para que concuerde con el input
  },
});

export default DashboardDiscount;
