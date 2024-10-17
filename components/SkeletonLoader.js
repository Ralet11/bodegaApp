import React from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const SkeletonLoader = () => {
  const shimmerAnimatedValue = new Animated.Value(0);
  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnimatedValue]);

  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const shimmerStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ translateX }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, styles.baseBackground]}>
        <Animated.View style={[shimmerStyle, styles.shimmer]} />
      </View>

      <View style={[styles.searchBar, styles.baseBackground]}>
        <Animated.View style={[shimmerStyle, styles.shimmer]} />
      </View>

      <View style={styles.section}>
        <View style={[styles.promoSlider, styles.baseBackground]}>
          <Animated.View style={[shimmerStyle, styles.shimmer]} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.textPlaceholder}>
          <View style={[styles.textLine, styles.baseBackground]}>
            <Animated.View style={[shimmerStyle, styles.shimmer]} />
          </View>
        </View>
      </View>

      <View style={styles.categorySection}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={[styles.categoryItem, styles.baseBackground]}>
            <Animated.View style={[shimmerStyle, styles.shimmer]} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.orderStatus, styles.baseBackground]}>
          <Animated.View style={[shimmerStyle, styles.shimmer]} />
        </View>
      </View>

      <View style={styles.section}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={[styles.horizontalScroll, styles.baseBackground]}>
            <Animated.View style={[shimmerStyle, styles.shimmer]} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  baseBackground: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
    borderRadius: 15,
  },
  shimmer: {
    width: '150%',
    height: '100%',
    opacity: 0.5,
  },
  header: {
    height: 60,
    marginBottom: 25,
    borderRadius: 15,
  },
  searchBar: {
    height: 50,
    marginBottom: 25,
    borderRadius: 12,
  },
  section: {
    marginBottom: 30,
  },
  promoSlider: {
    height: 220,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textPlaceholder: {
    marginBottom: 15,
  },
  textLine: {
    height: 25,
    borderRadius: 6,
    marginBottom: 15,
  },
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryItem: {
    width: (Dimensions.get('window').width - 80) / 4,
    height: 100,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  orderStatus: {
    height: 120,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  horizontalScroll: {
    height: 170,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default SkeletonLoader;
