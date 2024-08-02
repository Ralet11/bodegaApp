import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { addToCart, incrementQuantity, decrementQuantity } from '../redux/slices/cart.slice';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';

const DiscountCard = ({ discount, openDiscountModal, isBlockLayout }) => {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const token = useSelector(state => state?.user?.userInfo.data.token);

  const productInCart = cart.find(cartItem => cartItem.id === discount?.product?.id);

  const productPrice = parseFloat(discount?.product?.price || 0);
  const discountAmount = productPrice * (discount.percentage / 100);
  const finalPrice = productPrice - discountAmount;

  const handleSaveDiscount = async () => {
    try {
      await Axios.post(`${API_URL}/api/discounts/addToUser`, { discountId: discount.id }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Discount Saved',
        text2: 'The discount has been saved successfully.'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save the discount.'
      });
    }
  };

  const combineProductAndDiscount = (product, discount) => {
    const discountedPrice = discount.discountType === 'percentage'
      ? product.price - (product.price * discount.percentage / 100)
      : product.price - discount.fixedValue;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.img,
      price: `$${discountedPrice.toFixed(2)}`, // Format the price as a string with a dollar sign
      quantity: 1, // Default quantity to 1
      discount: true,
      discountId: discount.id,
      discountType: discount.delivery,
    };
  };

  const handleIncrementQuantity = () => {
    openDiscountModal(discount);
  };

  const getDeliveryType = (delivery) => {
    switch (delivery) {
      case 0: return 'Pick-up';
      case 1: return 'Delivery';
      case 2: return 'Order-in';
      default: return '';
    }
  };

 

  return (
    <View key={discount.id} style={[styles.discountCard, isBlockLayout && styles.blockLayout]}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: discount.image }} style={styles.discountImage} />
      </View>
      <View style={styles.discountDetails}>
        <View style={styles.header}>
          <Text style={styles.discountTitle}>{discount.productName}</Text>
          <TouchableOpacity style={styles.likeButton} onPress={handleSaveDiscount}>
            <FontAwesome name="heart" size={16} color={discount.saved ? "#ff6347" : "#ccc"} />
          </TouchableOpacity>
        </View>
        <Text style={styles.discountDescription}>{discount.productDescription}</Text>
        <Text style={styles.discountDescription}>{discount.description}</Text>
        <Text style={styles.productFinalPrice}>${finalPrice.toFixed(2)}</Text>
        <View style={styles.tagAndButtonContainer}>
          <View style={styles.tagContainer}>
            <View style={styles.percentageTag}>
              <Text style={styles.percentageText}>-{discount.percentage}%</Text>
            </View>
            <View style={styles.deliveryTag}>
              <Text style={styles.deliveryText}>{getDeliveryType(discount.delivery)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openDiscountModal(discount)}>
            <FontAwesome name="plus" size={12} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  discountCard: {
    flexDirection: 'row', // Disposición horizontal
    width: '100%', // Ancho total de la card
    backgroundColor: '#ffffff',
    borderRadius: 10, // Radio de borde
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 15,
    alignSelf: 'center',
    marginRight: 50,
    marginLeft: 50
  },
  blockLayout: {
    flexDirection: 'column', // Cambiar a disposición vertical para el diseño de bloque
    alignItems: 'center',
  },
  imageContainer: {
    width: '40%', // Ancho del contenedor de imagen
    overflow: 'hidden',
  },
  discountImage: {
    width: '100%',
    height: '100%',
  },
  discountDetails: {
    width: '60%', // Ancho del contenedor de detalles
    padding: 8, // Padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  discountTitle: {
    fontSize: 12, // Tamaño de la fuente
    fontWeight: 'bold',
    color: '#333',
  },
  discountDescription: {
    fontSize: 10, // Tamaño de la fuente
    color: '#666',
    marginBottom: 3,
  },
  productFinalPrice: {
    fontSize: 14, // Tamaño de la fuente
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8, // Añadir margen inferior para separar del contenedor de tags
  },
  tagAndButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinea los elementos verticalmente
  },
  percentageTag: {
    backgroundColor: '#e0f7e0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    marginRight: 5,
  },
  percentageText: {
    color: '#006400',
    fontWeight: 'bold',
    fontSize: 10,
  },
  deliveryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  deliveryText: {
    color: '#555',
    fontSize: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    padding: 2,
  },
  addButton: {
    backgroundColor: '#FF6347',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiscountCard;
