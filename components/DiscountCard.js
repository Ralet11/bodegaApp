import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { addToCart, incrementQuantity, decrementQuantity } from '../redux/slices/cart.slice';
import { API_URL } from '@env';
import ModalDiscount from '../components/modals/DiscountModal';

const DiscountCard = ({ discount, isBlockLayout, openDiscountModal }) => {
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

  console.log(discount, "disss")

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
    <View key={discount.id} style={isBlockLayout ? styles.discountBlockCard : styles.discountCard}>
      <TouchableOpacity onPress={() => openModal(discount)}>
        <Image source={{ uri: discount.image }} style={isBlockLayout ? styles.discountBlockImage : styles.discountImage} />
      </TouchableOpacity>
      <View style={styles.discountDetails}>
        <Text style={styles.discountTitle}>{discount.productName}</Text>
        <View style={styles.tagContainer}>
          <View style={styles.percentageTag}>
            <Text style={styles.percentageText}>-{discount.percentage}%</Text>
          </View>
          <View style={styles.deliveryTag}>
            <Text style={styles.deliveryText}>{getDeliveryType(discount.delivery)}</Text>
          </View>
        </View>
        <Text style={styles.discountDescription}>{discount.productDescription}</Text>
        <Text style={styles.productFinalPrice}>${finalPrice.toFixed(2)}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleIncrementQuantity}>
            <FontAwesome name="plus" size={14} color="#000" />
          </TouchableOpacity>
          {!isBlockLayout && (
            <TouchableOpacity style={styles.likeButton} onPress={handleSaveDiscount}>
              <FontAwesome name="heart" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        {isBlockLayout && (
          <TouchableOpacity style={styles.likeButtonBlock} onPress={handleSaveDiscount}>
            <FontAwesome name="heart" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  discountCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    marginRight: 10,
  },
  discountBlockCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    padding: 15,
    flexDirection: 'row',
  },
  discountImage: {
    width: '100%',
    height: 120,
  },
  discountBlockImage: {
    width: 100,
    height: 100,
    marginRight: 15,
  },
  discountDetails: {
    flex: 1,
    padding: 10,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  discountDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  productFinalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    padding: 5,
  },
  likeButtonBlock: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  addButton: {
    backgroundColor: '#FFD700', // Fondo amarillo cálido
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  percentageTag: {
    backgroundColor: '#e0f7e0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  percentageText: {
    color: '#006400',
    fontWeight: 'bold',
  },
  deliveryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  deliveryText: {
    color: '#555',
  },
});

export default DiscountCard;