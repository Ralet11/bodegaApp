import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { useNavigation } from '@react-navigation/native';
import colors from './themes/colors';

const DiscountShopScroll = ({ title, items, handleItemPress, allTags }) => {
  const colors = getColors();
  const styles = lightTheme(colors);
  const navigation = useNavigation();
  const tag = allTags.find((tag) => tag.name === title);

  const [distances, setDistances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyShops, setNearbyShops] = useState([]);
  const address = useSelector((state) => state?.user?.address?.formatted_address);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';

  useEffect(() => {
    const fetchDistances = async () => {
      setIsLoading(true);
      const newDistances = {};
      const nearby = [];
      for (const item of items) {
        if (item.address) {
          try {
            const response = await Axios.get(
              `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
                address
              )}&destinations=${encodeURIComponent(item.address)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const distanceTextKm = response.data.rows[0].elements[0].distance.text;
            const distanceValueKm = response.data.rows[0].elements[0].distance.value / 1000;

            // Solo agregar direcciones dentro del rango de 50 kilómetros
            if (distanceValueKm <= 50) {
              newDistances[item.address] = distanceTextKm;
              nearby.push(item);
            }
          } catch (error) {
            console.error('Error fetching distance:', error);
          }
        }
      }
      setDistances(newDistances);
      setNearbyShops(nearby);
      setIsLoading(false);
    };

    if (address) {
      fetchDistances();
    }
  }, [address, items]);

  // Función para obtener el mensaje de categoría con emoji
  const getCategoryMessage = (tag) => {
    const { name, emoji } = tag;

    switch (name.toLowerCase()) {
      case 'pizza':
        return `Top pizza in town ${emoji}`;
      case 'burgers':
        return `Best burgers for you ${emoji}`;
      case 'sushi':
        return `${emoji} Fresh sushi for all!`;
      case 'drinks':
        return `${emoji} Refreshing drinks!`;
      case 'desserts':
        return `${emoji} Sweetest desserts!`;
      case 'seafood':
        return `${emoji} Fresh seafood ready!`;
      case 'vegan':
        return `${emoji} Tasty vegan options!`;
      case 'vegetarian':
        return `${emoji} Great vegetarian dishes!`;
      case 'bbq':
        return `${emoji} Perfect BBQ for you!`;
      case 'pasta':
        return `${emoji} Delicious pasta awaits!`;
      case 'mexican':
        return `${emoji} Authentic Mexican taste!`;
      case 'indian':
        return `${emoji} Rich Indian flavors!`;
      case 'chinese':
        return `${emoji} Tasty Chinese cuisine!`;

      default:
        const randomMessages = [
          `Discover ${name} options ${emoji}`,
          `Try our ${name} dishes ${emoji}`,
          `Best ${name} recipes ${emoji}`,
          `Enjoy ${name} specialties ${emoji}`,
        ];

        return randomMessages[Math.floor(Math.random() * randomMessages.length)];
    }
  };

  const handleSeeMore = (tag) => {
    navigation.navigate('CategoryShops', { selectedTag: tag, allTags });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.textColor} />
      </View>
    );
  }

  if (nearbyShops.length === 0) {
    return null; // No renderizar nada si no hay tiendas cercanas para esta categoría
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getCategoryMessage(tag)}</Text>
        <TouchableOpacity onPress={() => handleSeeMore(tag)}>
          <Text style={styles.viewMore}>See more</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {nearbyShops.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemContainer}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.card}>
              <Image
                source={{ uri: item.image || item.deliveryImage }}
                style={styles.itemImage}
              />
              <View style={styles.itemContent}>
                <View style={styles.row}>
                  <View
                    style={[
                      styles.logoContainer,
                      { backgroundColor: colors.cardBackgroundColor },
                    ]}
                  >
                    <Image source={{ uri: item.logo }} style={styles.logoImage} />
                  </View>
                  <View style={styles.infoColumn}>
                    <Text
                      style={styles.itemName}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                    >
                      {item.name || item.product}
                    </Text>
                    <View style={styles.subInfoRow}>
                      <View style={styles.iconRow}>
                        <FontAwesome
                          name="street-view"
                          size={14}
                          color={colors.iconColor}
                        />
                        <Text style={styles.distanceText}>{distances[item.address]}</Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <FontAwesome name="star" size={14} color={colors.starColor} />
                        <Text style={styles.ratingText}>{item.rating.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Función para definir colores
const getColors = () => ({
  textColor: '#000000',
  secondaryTextColor: '#333333',
  backgroundColor: '#F5F5F5',
  cardBackgroundColor: '#FFFFFF',
  borderColor: '#E0E0E0',
  iconColor: '#666666',
  accentColor: '#FF6347',
  starColor: '#FFD700',
});

// Estilos comunes compartidos entre temas
const commonStyles = {
  container: { marginVertical: 20, paddingHorizontal: 15 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollView: { paddingVertical: 10 },
  viewMore: { fontSize: 14, fontWeight: '600' },
  itemContainer: { marginRight: 15, padding: 0 },
  card: {
    width: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 5,
  },
  itemImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  itemContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
  },
  logoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    width: '100%',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontSize: 14, fontWeight: '600' },
  distanceText: { fontSize: 14, marginLeft: 4 },
};

// Estilos para el tema claro
const lightTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: '#FFFFFF' },
    headerTitle: { ...commonStyles.headerTitle },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logoContainer: {
      ...commonStyles.logoContainer,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName },
    ratingText: { ...commonStyles.ratingText },
    distanceText: { ...commonStyles.distanceText },
    itemContent: { ...commonStyles.itemContent, backgroundColor: '#FFFFFF' },
  });

export default DiscountShopScroll;
