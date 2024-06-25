import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useColorScheme, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OrderSkeletonLoader = () => {
  const colorScheme = useColorScheme();
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  return (
    <View style={styles.container}>
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader} />
          <View style={styles.status} />
          <View style={styles.date} />
          <View style={styles.total} />
          <View style={styles.localInfo} />
          <View style={styles.detailsContainer}>
            <View style={styles.detailsText} />
            <View style={styles.detailsLink} />
          </View>
          <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
        </View>
      ))}
    </View>
  );
};

const commonStyles = {
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    height: 20,
    marginBottom: 8,
    borderRadius: 5,
  },
  status: {
    height: 16,
    marginBottom: 8,
    borderRadius: 5,
  },
  date: {
    height: 14,
    marginBottom: 8,
    borderRadius: 5,
  },
  localInfo: {
    height: 14,
    marginBottom: 8,
    borderRadius: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  detailsText: {
    height: 16,
    width: '40%',
    borderRadius: 5,
  },
  detailsLink: {
    height: 16,
    width: '30%',
    borderRadius: 5,
  },
  total: {
    height: 16,
    width: '50%',
    borderRadius: 5,
    marginTop: 8,
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: '#1e1e1e',
    borderColor: '#333',
    shadowColor: '#fff',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    backgroundColor: '#333',
  },
  status: {
    ...commonStyles.status,
    backgroundColor: '#333',
  },
  date: {
    ...commonStyles.date,
    backgroundColor: '#333',
  },
  localInfo: {
    ...commonStyles.localInfo,
    backgroundColor: '#333',
  },
  detailsText: {
    ...commonStyles.detailsText,
    backgroundColor: '#333',
  },
  detailsLink: {
    ...commonStyles.detailsLink,
    backgroundColor: '#333',
  },
  total: {
    ...commonStyles.total,
    backgroundColor: '#333',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f0f0f0',
  },
  card: {
    ...commonStyles.card,
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
  },
  cardHeader: {
    ...commonStyles.cardHeader,
    backgroundColor: '#e0e0e0',
  },
  status: {
    ...commonStyles.status,
    backgroundColor: '#e0e0e0',
  },
  date: {
    ...commonStyles.date,
    backgroundColor: '#e0e0e0',
  },
  localInfo: {
    ...commonStyles.localInfo,
    backgroundColor: '#e0e0e0',
  },
  detailsText: {
    ...commonStyles.detailsText,
    backgroundColor: '#e0e0e0',
  },
  detailsLink: {
    ...commonStyles.detailsLink,
    backgroundColor: '#e0e0e0',
  },
  total: {
    ...commonStyles.total,
    backgroundColor: '#e0e0e0',
  },
});

export default OrderSkeletonLoader;