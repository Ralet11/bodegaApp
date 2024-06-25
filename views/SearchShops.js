import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { lightTheme, darkTheme } from '../components/themeCategory';

const SearchShops = () => {
    const scheme = useColorScheme();
    const route = useRoute();
    const navigation = useNavigation();
    const { categoryId, categoryName } = route.params;
    const shopsByCategory = useSelector((state) => state.setUp.shops);
    const categories = useSelector((state) => state.setUp.categories);
    const [filteredShops, setFilteredShops] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('name');

    console.log(categoryId, categoryName)

    useEffect(() => {
        if (shopsByCategory && categoryId) {
            const shops = shopsByCategory[categoryId] || [];
            setFilteredShops(shops);
        }
    }, [shopsByCategory, categoryId]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (shopsByCategory && categoryId && shopsByCategory[categoryId]) {
            const filtered = shopsByCategory[categoryId].filter(shop =>
                shop.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredShops(filtered);
        }
    };

    const handleSortChange = (order) => {
        setSortOrder(order);
        const sorted = [...filteredShops].sort((a, b) => a[order].localeCompare(b[order]));
        setFilteredShops(sorted);
    };

    const changeAddress = () => {
        navigation.navigate('SetAddressScreen');
    };

    const changeCategory = (newCategoryId, newCategoryName) => {
        navigation.navigate('CategoryShops', { categoryId: newCategoryId, categoryName: newCategoryName });
    };

    const handleShopPress = (shop) => {
        navigation.navigate('Shop', { shop });
    };

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
      };

      const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
          navigation.navigate('SearchShops', { searchQuery });
        }
      };

    return (
        <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
            <View style={scheme === 'dark' ? darkTheme.header : lightTheme.header}>
                <TouchableOpacity onPress={toggleDrawer} style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}>
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
                <TouchableOpacity onPress={changeAddress} style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}>
                    <FontAwesome name="map-marker" size={24} color={scheme === 'dark' ? 'white' : 'black'} />
                </TouchableOpacity>
            </View>
            <View style={scheme === 'dark' ? darkTheme.categoryContainer : lightTheme.categoryContainer}>
                <Text style={scheme === 'dark' ? darkTheme.headerTitle : lightTheme.headerTitle}>{categoryName}</Text>
            </View>
            <ScrollView contentContainerStyle={scheme === 'dark' ? darkTheme.contentContainer : lightTheme.contentContainer}>
                {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <TouchableOpacity key={shop.id} onPress={() => handleShopPress(shop)}>
                            <View style={scheme === 'dark' ? darkTheme.card : lightTheme.card}>
                                <Image source={{ uri: shop.img }} style={scheme === 'dark' ? darkTheme.cardImage : lightTheme.cardImage} />
                                <View style={scheme === 'dark' ? darkTheme.cardContent : lightTheme.cardContent}>
                                    <Text style={scheme === 'dark' ? darkTheme.cardTitle : lightTheme.cardTitle}>{shop.name}</Text>
                                    <Text style={scheme === 'dark' ? darkTheme.cardSubtitle : lightTheme.cardSubtitle}>{shop.address}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={scheme === 'dark' ? darkTheme.noShopsText : lightTheme.noShopsText}>No shops available in this category</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default SearchShops;