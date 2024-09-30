import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

const PromoSlider = () => {
  const promos = [
    { id: 1, image: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1721242463/Portada_de_facebook_negro_y_amarillo_hamburguesa_y_patatas_fritas_foto_phe5bf.png' },
    { id: 2, image: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1721243364/Portada_de_facebook_negro_y_amarillo_hamburguesa_y_patatas_fritas_foto_1_liby8y.png' },
  ];

  return (
    <View style={styles.container}>
      <Swiper
        autoplay={true}
        autoplayTimeout={7}
        dot={<View style={styles.dot} />}  // Barra dorada en lugar de puntos
        activeDot={<View style={styles.activeDot} />}  // Barra activa dorada más grande
        paginationStyle={{ bottom: 5 }}  // Ajuste de la posición
      >
        {promos.map((promo) => (
          <View key={promo.id} style={styles.slide}>
            <Image source={{ uri: promo.image }} style={styles.image} />
          </View>
        ))}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180,  // Tamaño ajustado para que se vea como en la imagen de referencia
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 15,
  },
  dot: {
    backgroundColor: '#e0c080',  // Color dorado claro
    width: 30,  // Ancho de la barra no activa
    height: 4,  // Altura de la barra
    marginHorizontal: 3,  // Espacio entre las barras
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#FFD700',  // Color dorado brillante para la barra activa
    width: 40,  // Ancho de la barra activa
    height: 4,  // Altura de la barra activa
    marginHorizontal: 3,
    borderRadius: 2,
  },
});

export default PromoSlider;