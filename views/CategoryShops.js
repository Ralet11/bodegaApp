import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CategoryShops = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get the selected tag, all tags, and searchQuery from route.params
  const { selectedTag = null, allTags = [], searchQuery: initialSearchQuery = '' } = route.params;

  // State for active tag and search query
  const [activeTag, setActiveTag] = useState(selectedTag);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Unify all shops into a single array
  const shopsByCategory = useSelector((state) => state.setUp.shopsDiscounts);
  const allShops = Object.values(shopsByCategory).flat();

  // Function to filter shops based on searchQuery and active tag
  const filteredShops = allShops.filter((shop) => {
    const matchesName = shop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      Array.isArray(shop.tags) &&
      shop.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
    if (activeTag) {
      // If there's an active tag, filter shops that have that tag and match the input
      const matchesActiveTag =
        Array.isArray(shop.tags) && shop.tags.some((tag) => tag.name === activeTag.name);
      return matchesActiveTag && (matchesName || matchesTag);
    } else {
      // If there's no active tag, search in shop names and tags
      return matchesName || matchesTag;
    }
  });

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop });
  };

  const handleTagPress = (tag) => {
    // If the tag is already selected, deselect it
    if (activeTag?.id === tag.id) {
      setActiveTag(null); // Show all shops
    } else {
      setActiveTag(tag); // Select the new tag
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query); // Update state with input value
  };

  // Sort tags so the selectedTag is first
  const sortedTags = allTags;

  // useEffect to set the initial searchQuery when the component mounts
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2BB26" />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={['#F2BB26', '#F2A826']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <FontAwesome name="arrow-left" size={20} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {activeTag ? activeTag.name : 'All Businesses'}
            </Text>
            {activeTag && (
              <TouchableOpacity 
                onPress={() => setActiveTag(null)}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterText}>Clear Filter</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <FontAwesome name="sliders" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search container with shadow */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cafes, shops..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}
            >
              <FontAwesome name="times-circle" size={16} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tags Filter */}
      <View style={styles.tagsSectionContainer}>
        <View style={styles.tagsHeader}>
          <Text style={styles.tagsTitle}>Categories</Text>
          <Text style={styles.resultsCount}>{filteredShops.length} results</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollContent}
        >
          {sortedTags.map((tag) => (
            <TouchableOpacity
              key={tag?.id}
              style={[
                styles.tagButton,
                activeTag?.id === tag?.id && styles.tagButtonSelected,
              ]}
              onPress={() => handleTagPress(tag)}
            >
              {tag.emoji && (
                <Text style={styles.tagEmoji}>{tag.emoji}</Text>
              )}
              <Text
                style={[
                  styles.tagText,
                  activeTag?.id === tag?.id && styles.tagTextSelected,
                ]}
              >
                {tag?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Shops List */}
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredShops.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Featured Businesses</Text>
            {filteredShops.map((shop) => (
              <TouchableOpacity 
                key={shop.id} 
                onPress={() => handleShopPress(shop)}
                style={styles.cardWrapper}
                activeOpacity={0.7}
              >
                <View style={styles.card}>
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: shop.deliveryImage }} 
                      style={styles.cardImage} 
                      resizeMode="cover"
                    />
                    {shop.rating && (
                      <View style={styles.ratingBadge}>
                        <FontAwesome name="star" size={12} color="#FFF" />
                        <Text style={styles.ratingText}>{shop.rating}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{shop?.name}</Text>
                    <Text style={styles.cardSubtitle} numberOfLines={2}>{shop.address}</Text>
                    
                    {shop.tags && shop.tags.length > 0 && (
                      <View style={styles.shopTagsContainer}>
                        {shop.tags.slice(0, 2).map((tag, index) => (
                          <View key={index} style={styles.shopTag}>
                            <Text style={styles.shopTagText}>{tag.name}</Text>
                          </View>
                        ))}
                        {shop.tags.length > 2 && (
                          <View style={styles.shopTagMore}>
                            <Text style={styles.shopTagMoreText}>+{shop.tags.length - 2}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  <FontAwesome 
                    name="chevron-right" 
                    size={16} 
                    color="#ddd" 
                    style={styles.cardArrow}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <FontAwesome name="search" size={40} color="#ddd" />
            </View>
            <Text style={styles.noShopsText}>No businesses available</Text>
            <Text style={styles.noShopsSubtext}>Try adjusting your search or filters</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setActiveTag(null);
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerGradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  clearFilterButton: {
    marginTop: 2,
  },
  clearFilterText: {
    fontSize: 12,
    color: '#333',
    textDecorationLine: 'underline',
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 22.5,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 14,
    color: '#333',
  },
  clearSearchButton: {
    padding: 5,
  },
  tagsSectionContainer: {
    backgroundColor: '#FFF',
    paddingTop: 15,
    paddingBottom: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tagsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#777',
  },
  tagsScrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagButtonSelected: {
    backgroundColor: '#F2BB26',
    borderColor: '#F2BB26',
  },
  tagEmoji: {
    fontSize: 14,
    marginRight: 5,
  },
  tagText: {
    fontSize: 14,
    color: '#555',
  },
  tagTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginLeft: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  cardWrapper: {
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F2BB26',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#777',
    marginBottom: 8,
  },
  shopTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  shopTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginRight: 5,
  },
  shopTagText: {
    fontSize: 11,
    color: '#555',
  },
  shopTagMore: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  shopTagMoreText: {
    fontSize: 11,
    color: '#555',
  },
  cardArrow: {
    alignSelf: 'center',
    marginRight: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noShopsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  noShopsSubtext: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F2BB26',
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default CategoryShops;