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
    const [filteredShops, setFilteredShops] = useState(initialFilteredShops || []);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');

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

    const handleShopPress = (shop) => {
        navigation.navigate('Shop', { shop });
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
                    placeholderTextColor={scheme === 'dark' ? '#888' : '#aaa'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearchSubmit}
                />
            </View>
            <View style={styles.categoryContainer}>
                <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>
            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Found Shops</Text>
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
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#F2BB26',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    iconButton: {
        padding: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginHorizontal: 10,
        color: '#000',
    },
    categoryContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    resultsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#777',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20, // Added padding to ensure content doesn't get cut off
    },
    card: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        margin: 10, // Added margin for better spacing
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5, // Added margin for better text spacing
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#777',
    },
    noShopsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
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
        backgroundColor: '#333',
        borderBottomColor: '#444',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#222',
        color: '#FFF',
    },
    iconButton: {
        ...commonStyles.iconButton,
        color: '#FFF',
    },
    categoryContainer: {
        ...commonStyles.categoryContainer,
        backgroundColor: '#1E1E1E',
        borderBottomColor: '#444',
    },
    headerTitle: {
        ...commonStyles.headerTitle,
        color: '#FFF',
    },
    resultsContainer: {
        ...commonStyles.resultsContainer,
        backgroundColor: '#1E1E1E',
    },
    resultsTitle: {
        ...commonStyles.resultsTitle,
        color: '#FFF',
    },
    card: {
        ...commonStyles.card,
        backgroundColor: '#1E1E1E',
    },
    cardTitle: {
        ...commonStyles.cardTitle,
        color: '#FFF',
    },
    cardSubtitle: {
        ...commonStyles.cardSubtitle,
        color: '#AAA',
    },
    noShopsText: {
        ...commonStyles.noShopsText,
        color: '#AAA',
    },
});

const lightTheme = StyleSheet.create({
    ...commonStyles,
    safeArea: {
        ...commonStyles.safeArea,
        backgroundColor: '#FFF',
    },
    header: {
        ...commonStyles.header,
        backgroundColor: '#F2BB26',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#FFF',
        color: '#000',
    },
    iconButton: {
        ...commonStyles.iconButton,
        color: '#000',
    },
    categoryContainer: {
        ...commonStyles.categoryContainer,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        ...commonStyles.headerTitle,
        color: '#333',
    },
    resultsContainer: {
        ...commonStyles.resultsContainer,
        backgroundColor: '#FFF',
    },
    resultsTitle: {
        ...commonStyles.resultsTitle,
        color: '#555',
    },
    card: {
        ...commonStyles.card,
        backgroundColor: '#FFF',
    },
    cardTitle: {
        ...commonStyles.cardTitle,
        color: '#333',
    },
    cardSubtitle: {
        ...commonStyles.cardSubtitle,
        color: '#777',
    },
    noShopsText: {
        ...commonStyles.noShopsText,
        color: '#777',
    },
});

export default SearchShops;
