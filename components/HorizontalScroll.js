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
import { FontAwesome } from 'react-native-vector-icons';
import { useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { useNavigation } from '@react-navigation/native';

const HorizontalScroll = ({ title, items, handleItemPress, categoryId }) => {
  const scheme = useColorScheme();
  const colors = getColors(scheme);
  const styles = scheme === 'dark' ? darkTheme(colors) : lightTheme(colors);

  const [distances, setDistances] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const address = useSelector((state) => state?.user?.address?.formatted_address);
  const navigation = useNavigation();

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

  const handleCategoryPress = () => {
    navigation.navigate('CategoryShops', { categoryId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={handleCategoryPress}>
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
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name || item.product}
                    </Text>
                    <View style={styles.infoRow}>
                      <View style={styles.ratingContainer}>
                        <FontAwesome name="star" size={14} color={colors.starColor} />
                        <Text style={styles.ratingText}>4.0 (9k+)</Text>
                      </View>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.distanceText}>{distances[item.address]}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.deliveryTime}>24 min</Text>
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

// Function to define colors based on the color scheme
const getColors = (scheme) => ({
  textColor: scheme === 'dark' ? '#FFFFFF' : '#000000',
  secondaryTextColor: scheme === 'dark' ? '#BBBBBB' : '#777777',
  backgroundColor: scheme === 'dark' ? '#121212' : '#FFFFFF',
  cardBackgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
  borderColor: scheme === 'dark' ? '#333333' : '#CCCCCC',
  iconColor: scheme === 'dark' ? '#FFFFFF' : '#000000',
  accentColor: scheme === 'dark' ? '#FFD700' : 'tomato',
  starColor: '#FFD700', // Gold color for the star icon
});

// Common styles
const commonStyles = {
  container: { marginVertical: 20, paddingHorizontal: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  viewMore: { fontSize: 14 },
  scrollView: {},
  itemContainer: { marginRight: 15, padding: 5 },
  card: {
    width: 250,
    height: 175,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    resizeMode: 'cover',
  },
  itemContent: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 12,
  },
  dot: {
    fontSize: 12,
    marginHorizontal: 5,
  },
  deliveryTime: {
    fontSize: 12,
  },
};

// Light theme styles
const lightTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: colors.backgroundColor },
    title: { ...commonStyles.title, color: colors.textColor },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: colors.cardBackgroundColor,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName, color: colors.textColor },
    ratingText: { ...commonStyles.ratingText, color: colors.textColor },
    distanceText: { ...commonStyles.distanceText, color: colors.secondaryTextColor },
    dot: { ...commonStyles.dot, color: colors.secondaryTextColor },
    deliveryTime: { ...commonStyles.deliveryTime, color: colors.secondaryTextColor },
  });

// Dark theme styles
const darkTheme = (colors) =>
  StyleSheet.create({
    ...commonStyles,
    container: { ...commonStyles.container, backgroundColor: colors.cardBackgroundColor },
    title: { ...commonStyles.title, color: colors.textColor },
    viewMore: { ...commonStyles.viewMore, color: colors.accentColor },
    card: {
      ...commonStyles.card,
      backgroundColor: colors.cardBackgroundColor,
      borderColor: colors.borderColor,
    },
    itemName: { ...commonStyles.itemName, color: colors.textColor },
    ratingText: { ...commonStyles.ratingText, color: colors.textColor },
    distanceText: { ...commonStyles.distanceText, color: colors.secondaryTextColor },
    dot: { ...commonStyles.dot, color: colors.secondaryTextColor },
    deliveryTime: { ...commonStyles.deliveryTime, color: colors.secondaryTextColor },
  });

export default HorizontalScroll;
