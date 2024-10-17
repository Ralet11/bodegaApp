import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { useNavigation } from '@react-navigation/native';

const DiscountShopScroll = ({ title, items, handleItemPress, allTags }) => {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = scheme === 'dark' ? darkTheme(colors) : lightTheme(colors);
  const navigation = useNavigation();
  const tag = allTags.find((tag) => tag.name === title);

  const [distances, setDistances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const address = useSelector((state) => state?.user?.address?.formatted_address);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';

  useEffect(() => {
    const fetchDistances = async () => {
      setIsLoading(true);
      const newDistances = {};
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

            // Convert kilometers to miles (1 kilometer = 0.621371 miles)
            const distanceValueMiles = distanceValueKm * 0.621371;
            const distanceTextMiles = `${distanceValueMiles.toFixed(2)} mi`;

            // Only add to distances if it's within 20 miles
            if (distanceValueMiles <= 20) {
              newDistances[item.address] = distanceTextMiles;
            }
          } catch (error) {
            console.error('Error fetching distance:', error);
          }
        }
      }
      setDistances(newDistances);
      setIsLoading(false);
    };

    if (address) {
      fetchDistances();
    }
  }, [address, items]);

  // Function to get category message with emoji
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

  return (
    <View style={lightTheme(colors).container}>
      <View style={lightTheme(colors).header}>
        <Text style={lightTheme(colors).headerTitle}>{getCategoryMessage(tag)}</Text>
        <TouchableOpacity onPress={() => handleSeeMore(tag)}>
          <Text style={lightTheme(colors).viewMore}>See more</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.textColor} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={lightTheme(colors).scrollView}
        >
          {items.map((item, index) => {
            if (!distances[item.address]) {
              return null;
            }
            return (
              <TouchableOpacity
                key={index}
                style={lightTheme(colors).itemContainer}
                onPress={() => handleItemPress(item)}
              >
                <View style={lightTheme(colors).card}>
                  <Image
                    source={{ uri: item.image || item.deliveryImage }}
                    style={lightTheme(colors).itemImage}
                  />
                  <View style={lightTheme(colors).itemContent}>
                    <View style={lightTheme(colors).row}>
                      <View
                        style={[
                          lightTheme(colors).logoContainer,
                          { backgroundColor: colors.cardBackgroundColor },
                        ]}
                      >
                        <Image source={{ uri: item.logo }} style={lightTheme(colors).logoImage} />
                      </View>
                      <View style={lightTheme(colors).infoColumn}>
                        <Text
                          style={lightTheme(colors).itemName}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.5}
                        >
                          {item.name || item.product}
                        </Text>
                        <View style={lightTheme(colors).subInfoRow}>
                          <View style={lightTheme(colors).iconRow}>
                            <FontAwesome
                              name="street-view"
                              size={14}
                              color={colors.iconColor}
                            />
                            <Text style={lightTheme(colors).distanceText}>{distances[item.address]}</Text>
                          </View>
                          <View style={lightTheme(colors).ratingContainer}>
                            <FontAwesome name="star" size={14} color={colors.starColor} />
                            <Text style={lightTheme(colors).ratingText}>{item.rating.toFixed(2)}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

// Function to define colors based on the theme
const getColors = (scheme) => ({
  textColor: scheme === 'dark' ? '#E0E0E0' : '#000000', // Cambiado a negro puro
  secondaryTextColor: scheme === 'dark' ? '#B0B0B0' : '#333333', // Un gris oscuro más visible
  backgroundColor: scheme === 'dark' ? '#121212' : '#F5F5F5',
  cardBackgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  borderColor: scheme === 'dark' ? '#333333' : '#E0E0E0',
  iconColor: scheme === 'dark' ? '#B0B0B0' : '#666666',
  accentColor: scheme === 'dark' ? '#FFC300' : '#FF6347',
  starColor: '#FFD700',
});

// Common styles shared between themes
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

// Styles for light theme
const lightTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: '#FFFFFF' }, // Fondo blanco
    headerTitle: { ...commonStyles.headerTitle },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: '#FFFFFF', // Fondo blanco en las cards también
   
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
    itemName: { ...commonStyles.itemName}, // Negro puro
    ratingText: { ...commonStyles.ratingText }, // Cambiado a negro puro
    distanceText: { ...commonStyles.distanceText}, // Cambiado a negro puro
    itemContent: { ...commonStyles.itemContent, backgroundColor: '#FFFFFF' }, // Fondo blanco para el contenido
  });

// Styles for dark theme
const darkTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: colors.backgroundColor },
    headerTitle: { ...commonStyles.headerTitle, color: colors.textColor },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: colors.cardBackgroundColor,
      borderColor: colors.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    logoContainer: {
      ...commonStyles.logoContainer,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName, color: colors.textColor },
    ratingText: { ...commonStyles.ratingText, color: colors.secondaryTextColor },
    distanceText: { ...commonStyles.distanceText, color: colors.secondaryTextColor },
    itemContent: { ...commonStyles.itemContent, backgroundColor: colors.cardBackgroundColor },
  });

export default DiscountShopScroll;
