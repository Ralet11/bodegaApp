import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, TextInput, useColorScheme, StyleSheet, ScrollView } from 'react-native';
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

    const [initialShops, setInitialShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
    const [allTags, setAllTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        if (shopsByCategory && categoryId && !initialFilteredShops) {
            const shops = shopsByCategory[categoryId] || [];
            console.log('Original Shops:', shops);

            // Check for unique IDs
            const shopIds = shops.map(shop => shop.id);
            const uniqueShopIds = new Set(shopIds);

            if (shopIds.length !== uniqueShopIds.size) {
                console.warn('There are duplicate or missing shop IDs.');
            }

            // Remove duplicate shops
            const uniqueShops = shops.filter((shop, index, self) =>
                index === self.findIndex((s) =>
                    s.id === shop.id || (s.name === shop.name && s.address === shop.address)
                )
            );

            setInitialShops(uniqueShops);
            setFilteredShops(uniqueShops);
        } else if (initialFilteredShops) {
            setInitialShops(initialFilteredShops);
            setFilteredShops(initialFilteredShops);
        }
    }, [shopsByCategory, categoryId, initialFilteredShops]);

    // Extract all tags and remove duplicates
    useEffect(() => {
        if (initialShops.length > 0) {
            const tagsMap = new Map();
            initialShops.forEach(shop => {
                if (shop.tags) {
                    shop.tags.forEach(tag => {
                        if (!tagsMap.has(tag.id)) {
                            tagsMap.set(tag.id, tag);
                        }
                    });
                }
            });
            setAllTags(Array.from(tagsMap.values()));
        }
    }, [initialShops]);

    // Filter shops by search query and selected tag
    useEffect(() => {
        filterShops(searchQuery, selectedTag);
    }, [searchQuery, selectedTag, initialShops]);

    const filterShops = (query, tag) => {
        let filtered = initialShops;

        if (query) {
            filtered = filtered.filter(shop =>
                shop.name.toLowerCase().includes(query.toLowerCase()) ||
                (shop.tags && shop.tags.some(t => t.name.toLowerCase().includes(query.toLowerCase())))
            );
        }

        if (tag) {
            filtered = filtered.filter(shop =>
                shop.tags && shop.tags.some(t => t.id === tag.id)
            );
        }

        // Remove duplicates after filtering
        filtered = filtered.filter((shop, index, self) =>
            index === self.findIndex((s) =>
                s.id === shop.id || (s.name === shop.name && s.address === shop.address)
            )
        );

        setFilteredShops(filtered);
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleShopPress = (shop) => {
        navigation.navigate('Shop', { shop });
    };

    const handleTagPress = (tag) => {
        const newSelectedTag = selectedTag && selectedTag.id === tag.id ? null : tag;
        setSelectedTag(newSelectedTag);
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
                    onChangeText={handleSearch}
                />
            </View>

            {/* Show tags as clickable buttons */}
            <View style={styles.tagsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {allTags.map(tag => (
                        <TouchableOpacity
                            key={tag.id}
                            style={[
                                styles.tagButton,
                                selectedTag && selectedTag.id === tag.id && styles.tagButtonSelected,
                            ]}
                            onPress={() => handleTagPress(tag)}
                        >
                            <Text
                                style={[
                                    styles.tagText,
                                    selectedTag && selectedTag.id === tag.id && styles.tagTextSelected,
                                ]}
                            >
                                {tag.name} {tag.emoji}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Shops Found</Text>
            </View>

            <FlatList
                data={filteredShops}
                keyExtractor={(shop, index) => `${shop.id || shop.name}_${index}`}
                renderItem={({ item: shop }) => (
                    <TouchableOpacity onPress={() => handleShopPress(shop)}>
                        <View style={styles.card}>
                            <Image source={{ uri: shop.logo }} style={styles.shopImage} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{shop.name}</Text>
                                <Text style={styles.cardSubtitle}>{shop.address}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={
                    <Text style={styles.noShopsText}>No shops available in this category</Text>
                }
            />
        </SafeAreaView>
    );
};

const commonStyles = {
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 10,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
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
    tagsContainer: {
        height: 60,
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 5,
    },
    tagButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    tagButtonSelected: {
        backgroundColor: '#F2BB26',
    },
    tagText: {
        fontSize: 14,
        color: '#333',
    },
    tagTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
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
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#FFF',
        borderRadius: 12,
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
        borderRadius: 12,
        margin: 10,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
        paddingRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
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
    tagsContainer: {
        ...commonStyles.tagsContainer,
        backgroundColor: '#1E1E1E',
    },
    tagButton: {
        ...commonStyles.tagButton,
        backgroundColor: '#444',
    },
    tagButtonSelected: {
        ...commonStyles.tagButtonSelected,
        backgroundColor: '#FFD700',
    },
    tagText: {
        ...commonStyles.tagText,
        color: '#FFF',
    },
    tagTextSelected: {
        ...commonStyles.tagTextSelected,
        color: '#000',
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
    tagsContainer: {
        ...commonStyles.tagsContainer,
        backgroundColor: '#FFF',
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
