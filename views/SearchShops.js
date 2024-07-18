import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, useColorScheme, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';


const SearchShops = () => {
    const scheme = useColorScheme();
    const route = useRoute();
    const navigation = useNavigation();
    const { categoryId, categoryName, filteredShops: initialFilteredShops, searchQuery: initialSearchQuery } = route.params || {};
    const shopsByCategory = useSelector((state) => state.setUp.shops);
    const categories = useSelector((state) => state.setUp.categories);
    const [filteredShops, setFilteredShops] = useState(initialFilteredShops || []);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [sortOrder, setSortOrder] = useState('name');
    const [drawerVisible, setDrawerVisible] = useState(false);

    useEffect(() => {
        if (shopsByCategory && categoryId && !initialFilteredShops) {
            const shops = shopsByCategory[categoryId] || [];
            setFilteredShops(shops);
        }
    }, [shopsByCategory, categoryId, initialFilteredShops]);

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
            handleSearch(searchQuery);
        }
    };

    const styles = scheme === 'dark' ? darkTheme : lightTheme;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
                    <FontAwesome name="arrow-left" size={24} color={scheme === 'dark' ? '#FFD700' : '#333'} />
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
            <View style={styles.categoryContainer}>
                <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <TouchableOpacity key={shop.id} onPress={() => handleShopPress(shop)}>
                            <View style={styles.card}>
                                <Image source={{ uri: shop.img }} style={styles.shopImage} />
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{shop.name}</Text>
                                    <Text style={styles.cardSubtitle}>{shop.address}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noShopsText}>No shops available in this category</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const commonStyles = {
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    iconButton: {
        padding: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        color: '#000',
    },
    categoryContainer: {
        padding: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    contentContainer: {
        padding: 10,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    shopImage: {
        width: 100,
        height: 100,
    },
    cardContent: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    noShopsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
};

const darkTheme = StyleSheet.create({
    ...commonStyles,
    safeArea: {
        ...commonStyles.safeArea,
        backgroundColor: '#121212',
    },
    header: {
        ...commonStyles.header,
        backgroundColor: '#1f1f1f',
        borderBottomColor: '#333',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#333',
        color: '#fff',
    },
    iconButton: {
        ...commonStyles.iconButton,
        color: '#fff',
    },
    headerTitle: {
        ...commonStyles.headerTitle,
        color: '#fff',
    },
    card: {
        ...commonStyles.card,
        backgroundColor: '#1f1f1f',
        borderColor: '#333',
    },
    cardTitle: {
        ...commonStyles.cardTitle,
        color: '#fff',
    },
    cardSubtitle: {
        ...commonStyles.cardSubtitle,
        color: '#ccc',
    },
    noShopsText: {
        ...commonStyles.noShopsText,
        color: '#ccc',
    },
});

const lightTheme = StyleSheet.create({
    ...commonStyles,
    safeArea: {
        ...commonStyles.safeArea,
        backgroundColor: '#f9f9f9',
    },
    header: {
        ...commonStyles.header,
        backgroundColor: '#fff',
        borderBottomColor: '#ccc',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#eee',
        color: '#000',
    },
    iconButton: {
        ...commonStyles.iconButton,
        color: '#000',
    },
    headerTitle: {
        ...commonStyles.headerTitle,
        color: '#000',
    },
    card: {
        ...commonStyles.card,
        backgroundColor: '#fff',
    },
    cardTitle: {
        ...commonStyles.cardTitle,
        color: '#000',
    },
    cardSubtitle: {
        ...commonStyles.cardSubtitle,
        color: '#666',
    },
    noShopsText: {
        ...commonStyles.noShopsText,
        color: '#666',
    },
});

export default SearchShops;