import React from 'react';
import { View, Animated, useColorScheme, Dimensions, StyleSheet } from 'react-native';

const SkeletonLoader = () => {
  const scheme = useColorScheme();
  const shimmerAnimatedValue = new Animated.Value(0);
  const { width } = Dimensions.get('window');

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 1500,
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
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: scheme === 'dark' ? '#333' : '#E1E9EE',
    transform: [{ translateX }],
  };

  const baseColor = scheme === 'dark' ? '#444' : '#F2F8FC';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: baseColor }]}>
        <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: baseColor }]}>
        <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
      </View>

      <View style={styles.section}>
        <View style={[styles.promoSlider, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.textPlaceholder}>
          <View style={[styles.textLine, { backgroundColor: baseColor }]}>
            <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.categorySection}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={[styles.categoryItem, { backgroundColor: baseColor }]}>
            <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.orderStatus, { backgroundColor: baseColor }]}>
          <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
        </View>
      </View>

      <View style={styles.section}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={[styles.horizontalScroll, { backgroundColor: baseColor }]}>
            <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]} />
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
  },
  header: {
    height: 50,
    marginBottom: 20,
    borderRadius: 10,
  },
  searchBar: {
    height: 40,
    marginBottom: 20,
    borderRadius: 10,
  },
  section: {
    marginBottom: 20,
  },
  promoSlider: {
    height: 200,
    borderRadius: 10,
  },
  textPlaceholder: {
    marginBottom: 10,
  },
  textLine: {
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
  categorySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    width: (Dimensions.get('window').width - 60) / 4,
    height: 80,
    borderRadius: 10,
  },
  orderStatus: {
    height: 100,
    borderRadius: 10,
  },
  horizontalScroll: {
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default SkeletonLoader;
