import React, { useEffect, useRef } from 'react';
import { View, Animated, useColorScheme, Dimensions, StyleSheet } from 'react-native';

const ShopSkeletonLoader = () => {
  const scheme = useColorScheme();
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const shimmerStyle = {
    backgroundColor: scheme === 'dark' ? '#333' : '#E1E9EE',
    transform: [{ translateX }],
  };

  const baseColor = scheme === 'dark' ? '#444' : '#F2F8FC';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: baseColor }]}>
        <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
      </View>

      <View style={styles.section}>
        <View style={[styles.categoryItem, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
        <View style={[styles.categoryItem, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
        <View style={[styles.categoryItem, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.productCard, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
        <View style={[styles.productCard, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
        <View style={[styles.productCard, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, styles.shimmerOverlay]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  categoryItem: {
    height: 40,
    borderRadius: 10,
    marginBottom: 10,
  },
  productCard: {
    height: 140,
    borderRadius: 10,
    marginBottom: 20,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default ShopSkeletonLoader;