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

const DiscountShopScroll = ({ title, items, handleItemPress, allTags }) => {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = scheme === 'dark' ? darkTheme(colors) : lightTheme(colors);

  const tag = allTags.find(tag => tag.name === title);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getCategoryMessage(tag)}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.viewMore}>See more</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.textColor} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {items.map((item, index) => {
            if (!distances[item.address]) {
              return null;
            }
            return (
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
                            <Text style={styles.ratingText}>4.7</Text>
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
  textColor: scheme === 'dark' ? '#FFFFFF' : '#000000',
  secondaryTextColor: scheme === 'dark' ? '#BBBBBB' : '#777777',
  backgroundColor: scheme === 'dark' ? '#121212' : '#FFFFFF',
  cardBackgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  borderColor: scheme === 'dark' ? '#333333' : '#CCCCCC',
  iconColor: scheme === 'dark' ? '#FFFFFF' : '#000000',
  accentColor: scheme === 'dark' ? '#FFD700' : 'tomato',
  starColor: '#FFD700',
});

// Common styles shared between themes
const commonStyles = {
  container: { marginVertical: 20, paddingHorizontal: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollView: { paddingVertical: 10 },
  viewMore: { fontSize: 14 },
  itemContainer: { marginRight: 10, padding: 10 },
  card: {
    width: 250,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 5,
  },
  itemImage: {
    width: '100%',
    height: 125,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: 'cover',
  },
  itemContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  logoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 5,
    color: '#000',
    width: '100%',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, fontSize: 14, fontWeight: '600' },
  distanceText: { fontSize: 14, marginLeft: 5 },
};

// Styles for light theme
const lightTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: colors.backgroundColor },
    headerTitle: { ...commonStyles.headerTitle, color: colors.textColor },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: colors.cardBackgroundColor,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName, color: colors.textColor },
    ratingText: { ...commonStyles.ratingText, color: colors.secondaryTextColor },
    distanceText: { ...commonStyles.distanceText, color: colors.secondaryTextColor },
    itemContent: { ...commonStyles.itemContent, backgroundColor: colors.cardBackgroundColor },
  });

// Styles for dark theme
const darkTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: colors.cardBackgroundColor },
    headerTitle: { ...commonStyles.headerTitle, color: colors.textColor },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: colors.cardBackgroundColor,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName, color: colors.textColor },
    ratingText: { ...commonStyles.ratingText, color: colors.secondaryTextColor },
    distanceText: { ...commonStyles.distanceText, color: colors.secondaryTextColor },
    itemContent: { ...commonStyles.itemContent, backgroundColor: colors.cardBackgroundColor },
  });

export default DiscountShopScroll;
