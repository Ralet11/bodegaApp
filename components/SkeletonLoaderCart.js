import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, useColorScheme, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const CartSkeletonLoader = () => {
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

const commonStyles = {
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  goBackButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  headerTitle: {
    width: '80%',
    height: 20,
    borderRadius: 5,
  },
  addressContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  addressLabel: {
    height: 16,
    borderRadius: 5,
    marginBottom: 5,
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
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    height: 16,
    borderRadius: 5,
    marginBottom: 10,
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
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  quantityText: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  tipContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  tipLabel: {
    height: 16,
    borderRadius: 5,
    marginBottom: 10,
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
  },
  customTipInput: {
    height: 40,
    borderRadius: 10,
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
  },
  balanceText: {
    width: '60%',
    height: 20,
    borderRadius: 5,
  },
  useBalanceButton: {
    width: '35%',
    height: 40,
    borderRadius: 10,
  },
  summaryContainer: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    position: 'relative',
  },
  summaryText: {
    height: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  checkoutButton: {
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
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
    backgroundColor: '#1c1c1c',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#333',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#333',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    backgroundColor: '#444',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#444',
  },
  addressIcon: {
    ...commonStyles.addressIcon,
    backgroundColor: '#444',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#333',
  },
  cartItemImage: {
    ...commonStyles.cartItemImage,
    backgroundColor: '#444',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    backgroundColor: '#444',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    backgroundColor: '#444',
  },
  quantityButton: {
    ...commonStyles.quantityButton,
    backgroundColor: '#444',
  },
  quantityText: {
    ...commonStyles.quantityText,
    backgroundColor: '#444',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#333',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    backgroundColor: '#444',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#444',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#444',
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#333',
  },
  balanceText: {
    ...commonStyles.balanceText,
    backgroundColor: '#444',
  },
  useBalanceButton: {
    ...commonStyles.useBalanceButton,
    backgroundColor: '#444',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#333',
  },
  summaryText: {
    ...commonStyles.summaryText,
    backgroundColor: '#444',
  },
  checkoutButton: {
    ...commonStyles.checkoutButton,
    backgroundColor: '#444',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#f9f9f9',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#e0e0e0',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#e0e0e0',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    backgroundColor: '#d0d0d0',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#d0d0d0',
  },
  addressIcon: {
    ...commonStyles.addressIcon,
    backgroundColor: '#d0d0d0',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#e0e0e0',
  },
  cartItemImage: {
    ...commonStyles.cartItemImage,
    backgroundColor: '#d0d0d0',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    backgroundColor: '#d0d0d0',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    backgroundColor: '#d0d0d0',
  },
  quantityButton: {
    ...commonStyles.quantityButton,
    backgroundColor: '#d0d0d0',
  },
  quantityText: {
    ...commonStyles.quantityText,
    backgroundColor: '#d0d0d0',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#e0e0e0',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    backgroundColor: '#d0d0d0',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#d0d0d0',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#d0d0d0',
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#e0e0e0',
  },
  balanceText: {
    ...commonStyles.balanceText,
    backgroundColor: '#d0d0d0',
  },
  useBalanceButton: {
    ...commonStyles.useBalanceButton,
    backgroundColor: '#d0d0d0',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#e0e0e0',
  },
  summaryText: {
    ...commonStyles.summaryText,
    backgroundColor: '#d0d0d0',
  },
  checkoutButton: {
    ...commonStyles.checkoutButton,
    backgroundColor: '#d0d0d0',
  },
});

export default CartSkeletonLoader;
