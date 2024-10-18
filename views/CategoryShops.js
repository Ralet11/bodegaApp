import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const CategoryShops = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Recibimos el tag seleccionado, todos los tags y el searchQuery desde route.params
  const { selectedTag = null, allTags = [], searchQuery: initialSearchQuery = '' } = route.params;

  // Estado para manejar el tag activo y el query de búsqueda
  const [activeTag, setActiveTag] = useState(selectedTag);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Unificamos todos los shops en un solo array
  const shopsByCategory = useSelector((state) => state.setUp.shopsDiscounts);
  const allShops = Object.values(shopsByCategory).flat();

  // Función para filtrar los shops según el searchQuery y el tag activo
  const filteredShops = allShops.filter((shop) => {
    const matchesName = shop.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag =
      Array.isArray(shop.tags) &&
      shop.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
    if (activeTag) {
      // Si hay un tag activo, filtramos los shops que tengan ese tag y que coincidan con el input
      const matchesActiveTag =
        Array.isArray(shop.tags) && shop.tags.some((tag) => tag.name === activeTag.name);
      return matchesActiveTag && (matchesName || matchesTag);
    } else {
      // Si no hay tag activo, buscamos en los nombres y en los tags de los shops
      return matchesName || matchesTag;
    }
  });

  const handleShopPress = (shop) => {
    navigation.navigate('Shop', { shop });
  };

  const handleTagPress = (tag) => {
    // Si el tag ya está seleccionado, lo deseleccionamos
    if (activeTag?.id === tag.id) {
      setActiveTag(null); // Mostramos todos los shops
    } else {
      setActiveTag(tag); // Seleccionamos el nuevo tag
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query); // Actualizamos el estado con el valor del input
  };

  // Reordenamos los tags para que el selectedTag esté primero
  const sortedTags = allTags;

  // useEffect para setear el searchQuery inicial cuando el componente se monte
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { backgroundColor: '#F2BB26' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <FontAwesome name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{activeTag ? activeTag.name : 'Todos los Negocios'}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Campo de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search restaurants..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch} // Aquí actualizamos el input de búsqueda
        />
      </View>

      {/* Filtros de Tags */}
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortedTags.map((tag) => (
            <TouchableOpacity
              key={tag?.id}
              style={[
                styles.tagButton,
                activeTag?.id === tag?.id && styles.tagButtonSelected,
              ]}
              onPress={() => handleTagPress(tag)} // Cambiamos el tag activo o lo quitamos
            >
              <Text
                style={[
                  styles.tagText,
                  activeTag?.id === tag?.id && styles.tagTextSelected,
                ]}
              >
                {tag?.name} {tag.emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Shops */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {filteredShops.length > 0 ? (
          filteredShops.map((shop) => (
            <TouchableOpacity key={shop.id} onPress={() => handleShopPress(shop)}>
              <View style={styles.card}>
                <Image source={{ uri: shop.deliveryImage }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{shop?.name}</Text>
                  <Text style={styles.cardSubtitle}>{shop.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noShopsText}>No hay negocios disponibles</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#EEE',
    borderRadius: 20,
    paddingHorizontal: 15,
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
  cardImage: {
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
});

export default CategoryShops;
