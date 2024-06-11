import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../components/themes';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { setShops } from '../redux/slices/setUp.slice';
import HorizontalScroll from '../components/HorizontalScroll';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';

const Dashboard = () => {
  const scheme = useColorScheme();
  const [address, setAddress] = useState('');
  const [shopsByCategory, setShopsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const categories = useSelector((state) => state?.setUp?.categories) || [];
  const address1 = useSelector((state) => state?.user?.address) || [];
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user.userInfo.data.client)

  const categoryTitles = {
    1: 'Best smoke shops',
    2: 'Drinks',
    3: 'Our Restaurants',
    4: 'Markets',
  };

  useEffect(() => {
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

    fetchShops();
  }, []);

  console.log(user, "user")

  const changeAddress = () => {
    navigation.navigate('SetAddressScreen');
  };

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome
          key={i}
          name={i <= rating ? 'star' : 'star-o'}
          size={14}
          color="#FFD700"
        />
      );
    }
    return stars;
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
    return (
      <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={scheme === 'dark' ? '#fff' : '#000'} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
      <View style={scheme === 'dark' ? darkTheme.header : lightTheme.header}>
        <TouchableOpacity onPress={toggleDrawer} style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}>
          <FontAwesome name="bars" size={24} color={scheme === 'dark' ? 'white' : '#333'} />
        </TouchableOpacity>
        <TextInput
          style={scheme === 'dark' ? darkTheme.searchInput : lightTheme.searchInput}
          placeholder="Busca lugares, comidas..."
          placeholderTextColor="#aaa"
          value={address}
        />
        <TouchableOpacity onPress={changeAddress} style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}>
          <FontAwesome name="map-marker" size={24} color={scheme === 'dark' ? 'white' : '#333'} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={scheme === 'dark' ? darkTheme.contentContainer : lightTheme.contentContainer}>
        <PromoSlider />
        <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: scheme === 'dark' ? '#fff' : '#333' }}>
            What are you looking for today?
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={scheme === 'dark' ? darkTheme.category : lightTheme.category}
              onPress={() => handleCategoryPress(category)}
            >
              <Image source={{ uri: category.image }} style={scheme === 'dark' ? darkTheme.categoryImage : lightTheme.categoryImage} />
              <Text style={scheme === 'dark' ? darkTheme.categoryText : lightTheme.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {Object.keys(shopsByCategory).map(categoryId => (
          <HorizontalScroll
            key={categoryId}
            title={categoryTitles[categoryId] || `Category ${categoryId}`}
            items={shopsByCategory[categoryId]}
            scheme={scheme}
            handleItemPress={handleShopPress}
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
    </SafeAreaView>
  );
};

export default Dashboard;
