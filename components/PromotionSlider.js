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
        showsPagination={true}
        autoplay={true}
        autoplayTimeout={7}  // Cambia el valor para ajustar la velocidad
        style={styles.wrapper}
        paginationStyle={{ bottom: 10 }}
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
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  wrapper: {},
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
});

export default PromoSlider;