import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const EnhancedOrderSkeletonLoader = () => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;
  const cardScaleValue = useRef(new Animated.Value(0.98)).current;

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
        Animated.timing(cardScaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(cardScaleValue, {
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

  const renderCard = (index) => (
    <Animated.View
      key={index}
      style={[
        styles.card,
        {
          transform: [{ scale: cardScaleValue }],
          opacity: cardScaleValue.interpolate({
            inputRange: [0.98, 1],
            outputRange: [0.8, 1],
          }),
        },
      ]}
    >
      <View style={styles.savedAmount} />
      <View style={styles.statusBar}>
        <View style={styles.orderInfo} />
        <View style={styles.newOrderBadge} />
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.infoText} />
        <View style={styles.detailsLink} />
      </View>
      <View style={styles.divider} />
      <View style={styles.orderFooter}>
        <View style={styles.reorderButton} />
        <View style={styles.reviewButton} />
      </View>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX: translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {[...Array(3)].map((_, index) => renderCard(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 80,
    backgroundColor: '#f7f9fc',
  },
  card: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  savedAmount: {
    height: 28,
    width: '70%',
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: '#e8f0fe',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfo: {
    height: 18,
    width: '50%',
    borderRadius: 9,
    backgroundColor: '#e8f0fe',
  },
  newOrderBadge: {
    height: 24,
    width: 80,
    borderRadius: 12,
    backgroundColor: '#fff0e6',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    height: 14,
    width: '60%',
    borderRadius: 7,
    backgroundColor: '#e8f0fe',
  },
  detailsLink: {
    height: 14,
    width: '25%',
    borderRadius: 7,
    backgroundColor: '#e8f0fe',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#f0f4f8',
    marginBottom: 20,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reorderButton: {
    height: 36,
    width: '45%',
    borderRadius: 18,
    backgroundColor: '#e8f0fe',
  },
  reviewButton: {
    height: 36,
    width: '45%',
    borderRadius: 18,
    backgroundColor: '#e8f0fe',
  },
});

export default EnhancedOrderSkeletonLoader;
