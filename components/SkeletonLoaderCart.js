import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const CartSkeletonLoader = () => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.goBackButton} />
        <View style={styles.headerTitle} />
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
      <View style={styles.addressContainer}>
        <View style={styles.addressLabel} />
        <View style={styles.addressInputContainer}>
          <View style={styles.addressInput} />
          <View style={styles.addressIcon} />
        </View>
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
      <View style={styles.cartItemsContainer}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.cartItem}>
            <View style={styles.cartItemImage} />
            <View style={styles.cartItemDetails}>
              <View style={styles.cartItemName} />
              <View style={styles.row}>
                <View style={styles.cartItemPrice} />
                <View style={styles.quantityContainer}>
                  <View style={styles.quantityButton} />
                  <View style={styles.quantityText} />
                  <View style={styles.quantityButton} />
                </View>
              </View>
            </View>
            <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
          </View>
        ))}
      </View>
      <View style={styles.tipContainer}>
        <View style={styles.tipLabel} />
        <View style={styles.tipOptions}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.tipButton} />
          ))}
        </View>
        <View style={styles.customTipInput} />
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
      <View style={styles.balanceContainer}>
        <View style={styles.balanceText} />
        <View style={styles.useBalanceButton} />
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
      <View style={styles.summaryContainer}>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.summaryText} />
        ))}
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
      <View style={styles.checkoutButton}>
        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  goBackButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#d0d0d0',
  },
  headerTitle: {
    width: '80%',
    height: 20,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  addressContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  addressLabel: {
    height: 16,
    borderRadius: 5,
    marginBottom: 5,
    backgroundColor: '#d0d0d0',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#d0d0d0',
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d0d0d0',
  },
  cartItemsContainer: {
    marginBottom: 10,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e0e0e0',
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    height: 16,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#d0d0d0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    height: 16,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#d0d0d0',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d0d0d0',
  },
  quantityText: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 10,
    backgroundColor: '#d0d0d0',
  },
  tipContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  tipLabel: {
    height: 16,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#d0d0d0',
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tipButton: {
    width: '18%',
    height: 40,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  customTipInput: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  balanceText: {
    width: '60%',
    height: 20,
    borderRadius: 5,
    backgroundColor: '#d0d0d0',
  },
  useBalanceButton: {
    width: '35%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#d0d0d0',
  },
  summaryContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  summaryText: {
    height: 20,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#d0d0d0',
  },
  checkoutButton: {
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#d0d0d0',
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default CartSkeletonLoader;
