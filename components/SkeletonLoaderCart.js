import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ScrollView
} from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonProductsGrid = () => {
  const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación "shimmer": se mueve de -width a +width y se repite
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnimatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnimatedValue]);

  // Interpola el valor para trasladar la vista animada
  const translateX = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  // Vista que produce el efecto de "brillo" al desplazarse
  const Shimmer = () => (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.shimmer,
        { transform: [{ translateX }] },
      ]}
    />
  );

  // Cantidad de tarjetas "fantasma" (ajusta a tu gusto)
  const skeletonItems = Array.from({ length: 6 });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {skeletonItems.map((_, index) => (
        <View key={index} style={styles.card}>
          {/* Área para la imagen */}
          <View style={styles.imagePlaceholder} />

          {/* Nombre del producto */}
          <View style={styles.textPlaceholderShort} />

          {/* Precio */}
          <View style={styles.textPlaceholderMedium} />

          {/* Capa con el efecto shimmer */}
          <Shimmer />
        </View>
      ))}
    </ScrollView>
  );
};

export default SkeletonProductsGrid;

const styles = StyleSheet.create({
  // Contenedor con 2 columnas (flexWrap)
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },

  // Cada tarjeta
  card: {
    width: '48%',           // 2 columnas con margen entre ellas
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',   // Necesario para el shimmer animado
  },

  // Placeholder para la imagen
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#ccc',
  },

  // Placeholder corto (por ejemplo, nombre del producto)
  textPlaceholderShort: {
    width: '60%',
    height: 16,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    marginLeft: 8,
  },

  // Placeholder mediano (por ejemplo, precio)
  textPlaceholderMedium: {
    width: '40%',
    height: 16,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 8,
  },

  // Capa translúcida que se desplaza (shimmer)
  shimmer: {
    width: width * 0.5,               // Ancho de la banda de brillo
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
