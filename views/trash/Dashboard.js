import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  Modal,
  BackHandler,
  FlatList,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setAuxShops, setShops } from '../../redux/slices/setUp.slice';
import HorizontalScroll from '../../components/HorizontalScroll';
import PromoSlider from '../../components/PromotionSlider';
import AccountDrawer from '../../components/AccountDrawer';
import { setAddress, setAddresses } from '../../redux/slices/user.slice';
import OrderStatus from '../../components/OrderStatus';
import SkeletonLoader from '../../components/SkeletonLoader';
import { setUserDiscounts } from '../../redux/slices/setUp.slice';
import { lightTheme, darkTheme } from '../../components/themes';
// NOTA: ya no importamos socketIOClient acá

const Dashboard = () => {
  const scheme = useColorScheme();
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [filteredShopsByCategory, setFilteredShopsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('Pickup'); // 'Pickup' o 'Delivery'
  const categories = useSelector((state) => state?.setUp?.categories) || [];
  const address = useSelector((state) => state?.user?.address?.formatted_address);
  const addresses = useSelector((state) => state?.user?.addresses);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const ordersIn = useSelector((state) => state?.orders?.ordersIn);
  const auxShops = useSelector((state) => state?.setUp?.auxShops);
  const [allTags, setAllTags] = useState([]);
  const [filteredShopsByTags, setFilteredShopsByTags] = useState({});
  const orderTypeParam = deliveryMode === 'Delivery' ? 2 : deliveryMode === 'Pickup' ? 1 : null;

  const categoryTitles = {
    1: 'Best smoke shops',
    2: 'Drinks',
    3: 'Our Restaurants',
    4: 'Markets',
  };

  // NOTA: La lógica de socket (para sincronizar shops) se centraliza en el hook global useSocket (iniciado en App.js)
  // Por ello, aquí ya no se hace ninguna conexión local a socket.

  // Obtener shops de la API
  const fetchShops = async () => {
    try {
      const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCat`);
      setShopsByCategory(response.data);
      extractTags(response.data);
      filterShopsByTags(response.data, deliveryMode);
      filterShops(response.data, deliveryMode);
      setLoading(false);
      dispatch(setShops(response.data));
    } catch (error) {
      console.error('Error fetching shops:', error);
      setLoading(false);
    }
  };

  // Obtener direcciones del usuario
  const fetchAddress = async () => {
    if (!token) return;
    try {
      const response = await Axios.get(`${API_URL}/api/addresses/getById`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        dispatch(setAddresses(response.data));
        if (!response.data || response.data.length === 0) {
          setModalVisible(true);
        } else {
          dispatch(setAddress(response.data[0]));
          setModalVisible(false);
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Traer descuentos del usuario
 

  useEffect(() => {
    fetchShops();
    fetchAddress();
  }, [dispatch, token, auxShops]);

  // Bloqueo del botón back (para deshabilitar retrocesos)
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  // Mostrar modal si no hay dirección (tras 2 segundos)
  useFocusEffect(
    useCallback(() => {
      let timer;
      if (!address) {
        timer = setTimeout(() => {
          setModalVisible(true);
        }, 2000);
      } else {
        setModalVisible(false);
      }
      return () => clearTimeout(timer);
    }, [address])
  );

  // Limpiar búsqueda al enfocar
  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const changeAddress = () => {
    setAddressModalVisible(true);
  };

  const handleAddressSelect = (selectedAddress) => {
    dispatch(setAddress(selectedAddress));
    setAddressModalVisible(false);
  };

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop, orderTypeParam });
  };

  // Extraer tags únicas
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

  const handleCategoryPress = (selectedTag) => {
    navigation.navigate('CategoryShops', { selectedTag, allTags });
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleNavigate = (screen) => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const filteredShops = [];
      Object.keys(filteredShopsByTags).forEach((tagName) => {
        const shopsFound = filteredShopsByTags[tagName].filter((shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (shopsFound.length > 0) filteredShops.push(...shopsFound);
      });
      navigation.navigate('CategoryShops', {
        filteredShops,
        searchQuery,
        selectedTag: null,
        allTags,
      });
    }
  };

  // Funciones para filtrar shops según horarios, modo, etc.
  const filterShopsByTags = (shops, mode) => {
    const currentDateTime = new Date();
    const currentDay = currentDateTime.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
    const currentTime = currentDateTime.toTimeString().slice(0, 8);

    const filtered = {};
    Object.keys(shops).forEach((catId) => {
      shops[catId].forEach((shop) => {
        const isModeMatch = mode === 'orderIn' ? shop.orderIn : shop.pickUp;
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

  const handleToggle = (mode) => {
    setDeliveryMode(mode);
    filterShops(shopsByCategory, mode);
  };

  const filterShops = (shops, mode) => {
    const currentDateTime = new Date();
    const currentDay = currentDateTime.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
    const currentTime = currentDateTime.toTimeString().slice(0, 8);

    const filtered = {};
    Object.keys(shops).forEach((catId) => {
      filtered[catId] = shops[catId].filter((shop) => {
        const isModeMatch = mode === 'Delivery' ? shop.delivery : shop.pickUp;
        const isOpen = shop.openingHours.some((hour) => {
          return (
            hour.day === currentDay &&
            hour.open_hour <= currentTime &&
            hour.close_hour >= currentTime
          );
        });
        return isModeMatch && isOpen;
      });
    });
    setFilteredShopsByCategory(filtered);
  };

  const noShopsAvailable = !Object.keys(filteredShopsByCategory).some(
    (catId) => filteredShopsByCategory[catId].length > 0
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <SafeAreaView style={lightTheme.safeArea}>
      <View style={lightTheme.header}>
        <View style={lightTheme.addressToggleContainer}>
          <TouchableOpacity onPress={changeAddress} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="map-marker" size={20} color="#333" style={{ marginRight: 5 }} />
            <Text style={lightTheme.addressText} numberOfLines={1} ellipsizeMode="tail">
              {address}
            </Text>
            <FontAwesome name="caret-down" size={16} color="#333" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          <View style={lightTheme.deliveryToggleContainer}>
            <TouchableOpacity
              onPress={() => handleToggle('Pickup')}
              style={[
                lightTheme.deliveryToggleButton,
                { backgroundColor: deliveryMode === 'Pickup' ? '#FFC300' : 'transparent' },
              ]}
            >
              <Text style={{ color: deliveryMode === 'Pickup' ? '#000' : '#333' }}>Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rowBetween}>
          <TouchableOpacity onPress={toggleDrawer} style={lightTheme.iconButton}>
            <FontAwesome name="bars" size={24} color="#333" />
          </TouchableOpacity>
          <TextInput
            style={lightTheme.searchInput}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allTags.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              style={lightTheme.category}
              onPress={() => handleCategoryPress(tag)}
            >
              <Image
                source={{ uri: tag?.img || 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1628580001/placeholder.png' }}
                style={lightTheme.categoryImage}
              />
              <Text style={lightTheme.categoryText}>{tag.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {ordersIn && ordersIn.length > 0 && <OrderStatus />}
        {noShopsAvailable ? (
          <View style={styles.noShopsWrapper}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1720400961/c0e3cfe8-b839-496f-b6af-9e9f76d7360c_dev8hm.webp' }}
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ marginTop: 20, fontSize: 18, color: '#333' }}>
              No shops available in your area
            </Text>
          </View>
        ) : (
          Object.keys(filteredShopsByCategory).map((catId) => (
            filteredShopsByCategory[catId].length > 0 && (
              <HorizontalScroll
                key={catId}
                title={categoryTitles[catId] || `Category ${catId}`}
                items={filteredShopsByCategory[catId]}
                handleItemPress={handleShopPress}
                categoryId={catId}
                orderTypeParam={orderTypeParam}
              />
            )
          ))
        )}
      </ScrollView>

      <AccountDrawer
        visible={drawerVisible}
        onClose={toggleDrawer}
        onNavigate={handleNavigate}
        user={user}
      />

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <FontAwesome name="map-marker" size={50} color="#FFC107" />
            <Text style={styles.modalTitle}>You need to select an address to continue</Text>
            <TouchableOpacity
              style={styles.btnSelectAddress}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('SetAddressScreen');
              }}
            >
              <Text style={{ color: 'black' }}>Select Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={lightTheme.modalBackground}>
          <View style={lightTheme.modalContainer}>
            <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={lightTheme.closeButton}>
              <FontAwesome name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={lightTheme.modalTitle}>Select Your Address</Text>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAddressSelect(item)} style={lightTheme.addressItem}>
                  <Text style={lightTheme.addressName}>{item.name}</Text>
                  <Text style={lightTheme.addressTextModal}>{item.formatted_address}</Text>
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
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  noShopsWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    marginTop: 15,
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
  btnSelectAddress: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFC300',
    borderRadius: 5,
  },
});

export default Dashboard;
