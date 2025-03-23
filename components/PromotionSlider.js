import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const HypermodernImageSlider = ({
  items = [
    {
      uri: 'https://res.cloudinary.com/doqyrz0sg/video/upload/v1732142698/Red_Yellow_Modern_Bold_Fast_Food_Discount_Promotion_Video_zhptcf.mp4',
      type: 'video',
    },
  ],
  autoPlayInterval = 3000,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null); // Referencia al componente Video
  const isFocused = useIsFocused(); // Saber si la pantalla está enfocada

  // Manejo del desplazamiento automático
  useEffect(() => {
    if (items.length === 0 || !isFocused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex < items.length - 1 ? prevIndex + 1 : 0
      );
    }, autoPlayInterval);

    return () => clearInterval(intervalRef.current);
  }, [isFocused]);

  // Desplazarse al índice actual
  useEffect(() => {
    if (slideRef.current) {
      slideRef.current.scrollTo({
        x: currentIndex * width,
        animated: true,
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isFocused && videoRef.current) {
      // Pausar el video cuando la pantalla pierde el foco
      videoRef.current.stopAsync();
    }
  }, [isFocused]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const handleMomentumScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.didJustFinish) {
      // Avanzar al siguiente slide cuando termine el video
      setCurrentIndex((prevIndex) =>
        prevIndex < items.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  return items.length > 0 ? (
    <View style={[styles.container, style]}>
      <Animated.ScrollView
        ref={slideRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <View key={index} style={styles.slide}>
            {item.type === 'video' ? (
              <Video
                ref={currentIndex === index ? videoRef : null} // Referencia solo si está activo
                source={{ uri: item.uri }}
                style={styles.media}
                resizeMode="cover"
                shouldPlay={isFocused && currentIndex === index}
                isLooping={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onError={(error) => console.error('Video Error:', error)}
              />
            ) : (
              <Image
                source={{ uri: item.uri }}
                style={styles.media}
                onError={() => console.error('Image failed to load:', item.uri)}
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            />
            {item.title && (
              <BlurView intensity={80} tint="dark" style={styles.titleContainer}>
                <Text style={styles.title}>{item.title}</Text>
              </BlurView>
            )}
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        {items.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.paginationDotContainer}
            onPress={() => {
              setCurrentIndex(index);
            }}
          >
            <View
              style={[
                styles.paginationDot,
                currentIndex === index && styles.paginationDotActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.noItemsContainer}>
      <Text style={styles.noItemsText}>No items to display</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '95.5%',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 10
  },
  slide: {
    width,
    height: '100%',
    borderRadius: 20,
  },
  media: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20,
    backgroundColor: 'black',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: 20,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
  paginationDotContainer: {
    padding: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
    backgroundColor: '#fff',
  },
  noItemsContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  noItemsText: {
    fontSize: 18,
    color: '#999',
  },
});

export default HypermodernImageSlider;
