import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_URL } from '@env';
import Axios from 'react-native-axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice';

const ProductCard = ({ promotion, onPress, user, token }) => {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items); // Obtenemos los elementos del carrito del estado global
  
  if (!promotion || promotion.length === 0) {
    return null; // Mostrar un mensaje de "Cargando..." o manejar de otra forma si no hay datos.
  }

  const { product, quantity } = promotion[0];
  const [userPromo, setUserPromo] = useState(null);
  const purchasesLeft = quantity - (userPromo?.purchaseCount || 0); // Calcula las compras restantes

  // Verificar si el producto promocionado ya está en el carrito
  const isProductInCart = cart.some(item => item.id === product.id && item.promotion);

  useEffect(() => {
    const fetchUserPromotions = async () => {
      const data = {
        user_id: user.id,
        promotion_id: promotion[0].id,
      };
      try {
        const response = await Axios.post(`${API_URL}/api/promotions/getUserPromotions`, { data }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserPromo(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserPromotions();
  }, []);

  // Función para manejar la reclamación del premio
  const handleClaimReward = () => {
    if (purchasesLeft > 0) {
      Alert.alert("You have not yet reached the maximum purchases to claim the reward.");
      return;
    }

    // Agregar el producto relacionado a la promoción al carrito con precio 0.00
    dispatch(addToCart({
      ...product,
      quantity: 1,
      selectedExtras: {}, // Puedes agregar extras aquí si es necesario
      price: '0.00', // Precio establecido a 0.00
      currentPrice: '0.00', // Precio actual también en 0.00
      discount: false, // No es un descuento, es una promoción
      promotion: true, // Indica que este producto es una promoción
    }));

    Alert.alert("Success", "The reward has been added to your cart.");
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftContainer}>
        <View style={styles.iconsContainer}>
          {/* Renderiza una cantidad de íconos según 'quantity', usando 'certificate' para las compras realizadas */}
          {[...Array(quantity)].map((_, index) => (
            <Icon 
              key={index} 
              name={index < (userPromo?.purchaseCount || 0) ? "certificate" : "circle-o"} 
              size={20} 
              color="#F4A261" 
              style={styles.icon} 
            />
          ))}
        </View>
        {/* Texto indicando cuántas compras faltan o si la recompensa ha sido reclamada */}
        <Text style={styles.purchasesLeftText}>
          {isProductInCart ? "Reward claimed!" : (purchasesLeft > 0 ? `${purchasesLeft} purchases left to win` : "Reward available!")}
        </Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.titleText}>{product?.name}</Text>
        {/* Si se alcanzó el límite de compras y no se ha reclamado la recompensa, muestra el botón "Claim Reward" */}
        {purchasesLeft === 0 && !isProductInCart ? (
          <TouchableOpacity style={styles.claimButton} onPress={handleClaimReward}>
            <Text style={styles.buttonText}>Claim Reward</Text>
          </TouchableOpacity>
        ) : purchasesLeft === 0 && isProductInCart ? (
          // Si se ha reclamado la recompensa, muestra el icono de éxito
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={24} color="#28A745" />
          </View>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>View More</Text>
          </TouchableOpacity>
        )}
      </View>
      <Image source={{ uri: product?.img }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6E3',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 10,
    height: 110,
    elevation: 2,
    width: 380,
    alignSelf: 'center',
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    position: 'relative',
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  icon: {
    margin: 2,
  },
  purchasesLeftText: {
    marginTop: 5,
    fontSize: 12,
    color: '#3D3D3D',
    textAlign: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#3F3F3F',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  claimButton: {
    backgroundColor: '#28A745',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
  },
  image: {
    width: 110,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    resizeMode: 'cover',
  },
});

export default ProductCard;
