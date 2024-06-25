import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, useColorScheme, ActivityIndicator, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../components/themes';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setShops } from '../redux/slices/setUp.slice';
import HorizontalScroll from '../components/HorizontalScroll';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';
import { addAddress, setAddress, setAddresses } from '../redux/slices/user.slice';
import OrderStatus from '../components/OrderStatus';
import SkeletonLoader from '../components/SkeletonLoader';
import { setUserDiscounts } from '../redux/slices/setUp.slice';

const Dashboard = () => {
  const scheme = useColorScheme();
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input
  const categories = useSelector((state) => state?.setUp?.categories) || [];
  const address = useSelector((state) => state?.user?.address);
  const addresses = useSelector((state) => state?.user?.addresses);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const ordersIn = useSelector((state) => state?.orders.ordersIn);
  const auxShops = useSelector((state) => state?.setUp?.auxShops);

  const categoryTitles = {
    1: 'Best smoke shops',
    2: 'Drinks',
    3: 'Our Restaurants',
    4: 'Markets',
  };

  const fetchShops = async () => {
    try {
      const response = await Axios.get(`${API_URL}/api/local/getShopsOrderByCat`);
      setShopsByCategory(response.data);
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

      if (response.status === 200) {
        dispatch(setAddresses(response.data));
        if (!response.data || response.data.length === 0) {
          setModalVisible(true);
        } else {
          dispatch(setAddress(response.data[0].formatted_address));
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
          const response = await Axios.get(`${API_URL}/api/discounts/userDiscount/${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log(response.data, "discoutns")
          dispatch(setUserDiscounts(response.data));
        } catch (error) {
          console.error('Error fetching user discounts:', error);
        }
      };

      fetchUserDiscounts();
    }
  }, [user, token]);

  useEffect(() => {
    fetchShops();
    fetchAddress();
  }, [dispatch, token, auxShops]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Prevent back button press
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

  const changeAddress = () => {
    navigation.navigate('SetAddressScreen');
  };

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('CategoryShops', { categoryId: category.id, categoryName: category.name });
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleNavigate = (screen) => {
    setDrawerVisible(false);
    navigation.navigate(screen);
  };



  if (loading) {
    return <SkeletonLoader />;
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const filteredShops = [];
      Object.keys(shopsByCategory).forEach((categoryId) => {
        const shops = shopsByCategory[categoryId].filter((shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (shops.length > 0) {
          filteredShops.push(...shops);
        }
      });
      navigation.navigate('SearchShops', { filteredShops, searchQuery });
    }
  };

  return (
    <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
      <View style={scheme === 'dark' ? darkTheme.header : lightTheme.header}>
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
          value={searchQuery} // Bind the state to the TextInput
          onChangeText={setSearchQuery} // Update state on text change
          onSubmitEditing={handleSearchSubmit} // Handle search submit
        />
        <TouchableOpacity
          onPress={changeAddress}
          style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}
        >
          <FontAwesome name="map-marker" size={24} color={scheme === 'dark' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scheme === 'dark' ? darkTheme.contentContainer : lightTheme.contentContainer}>
        <PromoSlider />
        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text
            style={{ fontSize: 14, fontWeight: 'bold', color: scheme === 'dark' ? '#fff' : '#333' }}
          >
            What are you looking for today?
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </ScrollView>
        {ordersIn && ordersIn.length > 0 && <OrderStatus />}
        {Object.keys(shopsByCategory).map((categoryId) => (
          <HorizontalScroll
            key={categoryId}
            title={categoryTitles[categoryId] || `Category ${categoryId}`}
            items={shopsByCategory[categoryId]}
            scheme={scheme}
            handleItemPress={handleShopPress}
            categoryId={categoryId}
          />
        ))}
      </ScrollView>
      <AccountDrawer
        visible={drawerVisible}
        onClose={toggleDrawer}
        onNavigate={handleNavigate}
        scheme={scheme}
        user={user}
      />
      {/* Modal for no addresses */}
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
            <FontAwesome name="map-marker" size={50} color="yellow" />
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
                backgroundColor: 'black',
                borderRadius: 5,
              }}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('SetAddressScreen');
              }}
            >
              <Text style={{ color: 'yellow' }}>Select Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Dashboard;