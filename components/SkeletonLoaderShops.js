import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const EnhancedShopSkeletonLoader = () => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;
  const headerScaleValue = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(headerScaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(headerScaleValue, {
          toValue: 0.98,
          duration: 1000,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const renderShimmer = () => (
    <LinearGradient
      colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateX: translateX }],
        },
      ]}
    />
  );

  const renderCategoryItem = (index: number) => (
    <Animated.View
      key={`category-${index}`}
      style={[
        styles.categoryItem,
        {
          transform: [{ scale: headerScaleValue }],
          opacity: headerScaleValue.interpolate({
            inputRange: [0.98, 1],
            outputRange: [0.8, 1],
          }),
        },
      ]}
    >
      {renderShimmer()}
    </Animated.View>
  );

  const renderProductCard = (index: number) => (
    <View key={`product-${index}`} style={styles.productCard}>
      <View style={styles.productImage}>
        {renderShimmer()}
      </View>
      <View style={styles.productDetails}>
        <View style={styles.productTitle}>
          {renderShimmer()}
        </View>
        <View style={styles.productPrice}>
          {renderShimmer()}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ scale: headerScaleValue }],
            opacity: headerScaleValue.interpolate({
              inputRange: [0.98, 1],
              outputRange: [0.8, 1],
            }),
          },
        ]}
      >
        {renderShimmer()}
      </Animated.View>

      <View style={styles.section}>
        {[...Array(3)].map((_, index) => renderCategoryItem(index))}
      </View>

      <View style={styles.section}>
        {[...Array(3)].map((_, index) => renderProductCard(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  header: {
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: '#e8f0fe',
    overflow: 'hidden',
  },
  section: {
    marginBottom: 24,
  },
  categoryItem: {
    height: 48,
    borderRadius: 24,
    marginBottom: 12,
    backgroundColor: '#e8f0fe',
    overflow: 'hidden',
  },
  productCard: {
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#e8f0fe',
    overflow: 'hidden',
  },
  productDetails: {
    padding: 12,
  },
  productTitle: {
    height: 16,
    width: '70%',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e8f0fe',
    overflow: 'hidden',
  },
  productPrice: {
    height: 16,
    width: '40%',
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    overflow: 'hidden',
  },
});

export default EnhancedShopSkeletonLoader;