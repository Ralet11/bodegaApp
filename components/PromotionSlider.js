import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HypermodernImageSlider = ({
  images = ['https://res.cloudinary.com/doqyrz0sg/image/upload/v1721243364/Portada_de_facebook_negro_y_amarillo_hamburguesa_y_patatas_fritas_foto_1_liby8y.png'], // Default to an empty array if images is undefined or null
  autoPlayInterval = 3000,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideRef = useRef(null);

  useEffect(() => {
    if (images.length === 0) return; // No images, no autoplay

    const timer = setInterval(() => {
      if (currentIndex < images.length - 1) {
        slideRef.current.scrollTo({
          x: (currentIndex + 1) * width,
          animated: true,
        });
      } else {
        slideRef.current.scrollTo({
          x: 0,
          animated: true,
        });
      }
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [currentIndex, images.length, autoPlayInterval]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const handleMomentumScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  return images.length > 0 ? (
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
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image source={{ uri: image.uri || image }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradient}
            />
            {image.title && (
              <BlurView intensity={80} tint="dark" style={styles.titleContainer}>
                <Animated.Text
                  style={[
                    styles.title,
                    {
                      opacity: scrollX.interpolate({
                        inputRange: [
                          (index - 1) * width,
                          index * width,
                          (index + 1) * width,
                        ],
                        outputRange: [0, 1, 0],
                        extrapolate: 'clamp',
                      }),
                      transform: [
                        {
                          translateY: scrollX.interpolate({
                            inputRange: [
                              (index - 1) * width,
                              index * width,
                              (index + 1) * width,
                            ],
                            outputRange: [20, 0, 20],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {image.title}
                </Animated.Text>
              </BlurView>
            )}
          </View>
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={styles.paginationDotContainer}
            onPress={() => {
              slideRef.current.scrollTo({
                x: index * width,
                animated: true,
              });
            }}
          >
            <Animated.View
              style={[
                styles.paginationDot,
                {
                  opacity: scrollX.interpolate({
                    inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scale: scrollX.interpolate({
                        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
                        outputRange: [1, 1.5, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.noImagesContainer}>
      <Text style={styles.noImagesText}>No images to display</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200, // Reducimos la altura
    width: '100%',
    borderRadius: 20, // Añadimos bordes redondeados
    overflow: 'hidden', // Nos aseguramos de que los bordes redondeados funcionen
  },
  slide: {
    width,
    height: '100%',
    borderRadius: 20, // Borde redondeado en cada slide
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 20, // Bordes redondeados para las imágenes
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: 20, // Aplicamos el borde redondeado también al gradiente
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
  },
  noImagesContainer: {
    height: 200, // Ajustamos la altura para que coincida
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  noImagesText: {
    fontSize: 18,
    color: '#999',
  },
});

export default HypermodernImageSlider;
