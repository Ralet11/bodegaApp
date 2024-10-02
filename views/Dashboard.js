import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, useColorScheme, Modal, BackHandler, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setAuxShops, setShops } from '../redux/slices/setUp.slice';
import HorizontalScroll from '../components/HorizontalScroll';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';
import { setAddress, setAddresses } from '../redux/slices/user.slice';
import OrderStatus from '../components/OrderStatus';
import SkeletonLoader from '../components/SkeletonLoader';
import { setUserDiscounts } from '../redux/slices/setUp.slice';
import { lightTheme, darkTheme } from '../components/themes';
import socketIOClient from "socket.io-client";


const Dashboard = () => {
  const scheme = useColorScheme();
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [filteredShopsByCategory, setFilteredShopsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('Pickup');
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
  console.log(address, "address")

  const categoryTitles = {
    1: 'Best smoke shops',
    2: 'Drinks',
    3: 'Our Restaurants',
    4: 'Markets',
  };
  console.log(auxShops, "auxShops")

  useEffect(() => {
    const socket = socketIOClient(`${API_URL}`);

    const syncShops = () => {
      console.log("probando sync")
      dispatch(setAuxShops());
    }

    socket.on('syncShops', syncShops);

    return () => {
      socket.off('syncShops');
      socket.disconnect();
    };
  }, [dispatch, token]);

  const fetchShops = async () => {
    try {
      console.log("acstualizando shop")
      const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCat`);
      setShopsByCategory(response.data);
      extractTags(response.data); // Extraer y guardar los tags
      filterShopsByTags(response.data, deliveryMode);
      filterShops(response.data, deliveryMode);
      setLoading(false);
      dispatch(setShops(response.data));
    } catch (error) {
      console.error('Error fetching shops:', error);
      setLoading(false);
    }
  };

  const fetchAddress = async () => {
    if (!token) {
      console.warn('Token not available');
      return;
    }

    try {
      const response = await Axios.get(`${API_URL}/api/addresses/getById`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data)

      if (response.status === 200) {
        dispatch(setAddresses(response.data));
        if (!response.data || response.data.length === 0) {
          console.log(response.data, "en modal visi")
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

  useEffect(() => {

    if (user?.id && token) {
      const fetchUserDiscounts = async () => {
        try {
          console.log("actualizando dicounts")
          const response = await Axios.get(`${API_URL}/api/discounts/userDiscount/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          dispatch(setUserDiscounts(response.data));
        } catch (error) {
          console.error('Error fetching user discounts:', error);
        }
      };

      fetchUserDiscounts();
    }
  }, [user, token, auxShops]);

  useEffect(() => {

    fetchShops();
    fetchAddress();
  }, [dispatch, token, auxShops]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

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

  useFocusEffect(
    useCallback(() => {
      setSearchQuery('');
    }, [])
  );

  const changeAddress = () => {
    setAddressModalVisible(true);
  };

  const handleAddressSelect = (selectedAddress) => {
    console.log(selectedAddress, "selectedAddress")
    dispatch(setAddress(selectedAddress));
    setAddressModalVisible(false);
  };

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop, orderTypeParam });
  };

  const extractTags = (shops) => {
    const tags = new Set(); // Usamos un Set para evitar duplicados
    Object.keys(shops).forEach((categoryId) => {
        shops[categoryId].forEach((shop) => {
            if (shop.tags && Array.isArray(shop.tags)) {
                shop.tags.forEach((tag) => tags.add(JSON.stringify(tag))); // Convertimos el objeto tag a string para que Set pueda detectar duplicados
            }
        });
    });
    const uniqueTagsArray = Array.from(tags).map(tag => JSON.parse(tag)); // Volvemos a convertir los tags a objetos
    setAllTags(uniqueTagsArray); // Guardamos los tags completos en el estado
};

  const handleCategoryPress = (selectedTag) => {
    console.log(selectedTag, "tag")
   /*  navigation.navigate('CategoryShops', { categoryId: category.id, categoryName: category.name }); */
   navigation.navigate( 'CategoryShops', {selectedTag, allTags });
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

        // Filtrar los shops por el input de búsqueda
        Object.keys(filteredShopsByTags).forEach((tagName) => {
            const shops = filteredShopsByTags[tagName].filter((shop) =>
                shop.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (shops.length > 0) {
                filteredShops.push(...shops);
            }
        });

        // Navegar a CategoryShops, pasando el searchQuery y un selectedTag como null
        navigation.navigate('CategoryShops', { filteredShops, searchQuery, selectedTag: null, allTags });
    }
};

const filterShopsByTags = (shops, mode) => {
  const currentDateTime = new Date();
  const currentDay = currentDateTime.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
  const currentTime = currentDateTime.toTimeString().slice(0, 8);

  const filtered = {};
  Object.keys(shops).forEach((categoryId) => {
      shops[categoryId].forEach((shop) => {
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
    const currentTime = currentDateTime.toTimeString().slice(0, 8); // Obtener la hora actual en formato HH:MM:SS

    const filtered = {};
    Object.keys(shops).forEach((categoryId) => {
      filtered[categoryId] = shops[categoryId].filter((shop) => {
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
    (categoryId) => filteredShopsByCategory[categoryId].length > 0
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
      <View style={scheme === 'dark' ? darkTheme.header : lightTheme.header}>
        <View style={scheme === 'dark' ? darkTheme.addressToggleContainer : lightTheme.addressToggleContainer}>
          <TouchableOpacity onPress={changeAddress} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="map-marker" size={20} color={scheme === 'dark' ? '#fff' : '#333'} style={{ marginRight: 5 }} />
            <Text
              style={scheme === 'dark' ? darkTheme.addressText : lightTheme.addressText}
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {address}
            </Text>
            <FontAwesome name="caret-down" size={16} color={scheme === 'dark' ? '#fff' : '#333'} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
          <View style={scheme === 'dark' ? darkTheme.deliveryToggleContainer : lightTheme.deliveryToggleContainer}>
           
            <TouchableOpacity
              onPress={() => handleToggle('Pickup')}
              style={[
                scheme === 'dark' ? darkTheme.deliveryToggleButton : lightTheme.deliveryToggleButton,
                { backgroundColor: deliveryMode === 'Pickup' ? '#FFC300' : 'transparent' }
              ]}
            >
              <Text style={{ color: deliveryMode === 'Pickup' ? '#000' : '#333' }}>Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
          <TouchableOpacity
            onPress={toggleDrawer}
            style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}
          >
            <FontAwesome name="bars" size={24} color={scheme === 'dark' ? 'white' : '#333'} />
          </TouchableOpacity>
          <TextInput
            style={scheme === 'dark' ? darkTheme.searchInput : lightTheme.searchInput}
            placeholder="Search places, foods..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={scheme === 'dark' ? darkTheme.contentContainer : lightTheme.contentContainer}>
        <PromoSlider />
        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '900', color: scheme === 'dark' ? '#fff' : '#333' }}
          >
            What are you looking for today?
          </Text>
        </View>
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={scheme === 'dark' ? darkTheme.category : lightTheme.category}
              onPress={() => handleCategoryPress(category)}
            >
              <Image
                source={{ uri: category.image }}
                style={scheme === 'dark' ? darkTheme.categoryImage : lightTheme.categoryImage}
              />
              <Text style={scheme === 'dark' ? darkTheme.categoryText : lightTheme.categoryText}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView> */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {allTags.map((tag) => (
    <TouchableOpacity
      key={tag.id}
      style={scheme === 'dark' ? darkTheme.category : lightTheme.category}
      onPress={() => handleCategoryPress(tag)} // Pasamos 'null' como categoría si no tienes la categoría asociada aún
    >
      <Image
        source={{ uri: tag?.img || 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1628580001/placeholder.png' }}
        style={scheme === 'dark' ? darkTheme.categoryImage : lightTheme.categoryImage}
      />
      <Text style={scheme === 'dark' ? darkTheme.categoryText : lightTheme.categoryText}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  ))}
</ScrollView>
        {ordersIn && ordersIn.length > 0 && <OrderStatus />}
        {noShopsAvailable ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Image
              source={{ uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1720400961/c0e3cfe8-b839-496f-b6af-9e9f76d7360c_dev8hm.webp' }} // Reemplaza con tu URL de imagen
              style={{ width: 200, height: 200 }}
            />
            <Text style={{ marginTop: 20, fontSize: 18, color: scheme === 'dark' ? '#fff' : '#333' }}>
              No shops available in your area
            </Text>
          </View>
        ) : (
          Object.keys(filteredShopsByCategory).map((categoryId) => (
            filteredShopsByCategory[categoryId].length > 0 && (
              <HorizontalScroll
                key={categoryId}
                title={categoryTitles[categoryId] || `Category ${categoryId}`}
                items={filteredShopsByCategory[categoryId]}
                scheme={scheme}
                handleItemPress={handleShopPress}
                categoryId={categoryId}
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
        scheme={scheme}
        user={user}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: scheme === 'dark' ? '#333' : '#fff',
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <FontAwesome name="map-marker" size={50} color="#FFC107" />
            <Text
              style={{
                marginTop: 15,
                fontSize: 18,
                textAlign: 'center',
                color: scheme === 'dark' ? '#fff' : '#333',
              }}
            >
              You need to select an address to continue
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 20,
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: '#FFC300', // Cambiado a amarillo cálido
                borderRadius: 5,
              }}
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
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => {
          setAddressModalVisible(!addressModalVisible);
        }}
      >
        <View style={scheme === 'dark' ? darkTheme.modalBackground : lightTheme.modalBackground}>
          <View style={[scheme === 'dark' ? darkTheme.modalContainer : lightTheme.modalContainer, scheme === 'dark' && { backgroundColor: '#333' }]}>
            <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={scheme === 'dark' ? darkTheme.closeButton : lightTheme.closeButton}>
              <FontAwesome name="close" size={24} color={scheme === 'dark' ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={scheme === 'dark' ? darkTheme.modalTitle : lightTheme.modalTitle}>
              Select Your Address
            </Text>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleAddressSelect(item)} style={scheme === 'dark' ? darkTheme.addressItem : lightTheme.addressItem}>
                  <Text style={scheme === 'dark' ? darkTheme.addressName : lightTheme.addressName}>
                    {item.name}
                  </Text>
                  <Text style={scheme === 'dark' ? darkTheme.addressTextModal : lightTheme.addressTextModal}>
                    {item.formatted_address}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={scheme === 'dark' ? darkTheme.separator : lightTheme.separator} />}
              contentContainerStyle={scheme === 'dark' ? darkTheme.flatListContent : lightTheme.flatListContent}
            />
            <TouchableOpacity
              style={scheme === 'dark' ? darkTheme.addButton : lightTheme.addButton}
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate('SetAddressScreen');
              }}
            >
              <Text style={scheme === 'dark' ? darkTheme.addButtonText : lightTheme.addButtonText}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  addressItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
});

export default Dashboard;