import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity } from '../redux/slices/cart.slice';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const ProductDetail = ({ product, onAddToCart, onBack, shop }) => {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = lightStyles;
  const cart = useSelector(state => state.cart.items);

  console.log(product, "prod");

  const [modalVisible, setModalVisible] = useState(false);
  // Definimos precio original y precio final (después del descuento)
  const originalPrice = parseFloat(product?.price) || 0;
  const finalPrice = parseFloat(product?.finalPrice) || originalPrice;
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);

    // Simulación de retraso para mostrar el loader
    setTimeout(() => {
      const existingProduct = cart.find(item => item.id === product.id);

      if (existingProduct) {
        for (let i = 0; i < quantity; i++) {
          dispatch(incrementQuantity(existingProduct.id));
        }
      } else {
        dispatch(
          addToCart({
            ...product,
            quantity,
            originalPrice: originalPrice.toFixed(2),
            finalPrice: finalPrice.toFixed(2),
          })
        );
      }

      setIsLoading(false);
      onBack();
    }, 1500); // Simulación de 1.5 segundos
  };

  // Según product.availableFor (0,1,2), mostramos Dine-in, Pick-up o ambas
  const renderAvailableFor = () => {
    switch (product.availableFor) {
      case 0:
        return (
          <View style={styles.option}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={styles.iconColor.color} />
            <Text style={styles.optionText}>Dine-in</Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.option}>
            <MaterialCommunityIcons name="walk" size={20} color={styles.iconColor.color} />
            <Text style={styles.optionText}>Pick-up</Text>
          </View>
        );
      case 2:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color={styles.iconColor.color} />
            <Text style={styles.optionText}>Dine-in</Text>
            <View style={{ width: 10 }} />
            <MaterialCommunityIcons name="walk" size={20} color={styles.iconColor.color} />
            <Text style={styles.optionText}>Pick-up</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <FontAwesome name="arrow-left" size={24} color={styles.backIcon.color} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: product.image }} style={styles.image} />

        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          {product.discountPercentage > 0 && (
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
              <Text style={styles.discountBadge}>-{product.discountPercentage}%</Text>
            </View>
          )}
          <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.additionalInfoContainer}>
          <Text style={styles.subTitle}>Available for:</Text>
          <View style={styles.optionsRow}>{renderAvailableFor()}</View>

          <Text style={styles.subTitle}>Payment Methods:</Text>
          <View style={styles.paymentOptions}>
            <View style={styles.paymentOption}>
              <FontAwesome name="cc-stripe" size={18} color={styles.iconColor.color} />
              <Text style={styles.paymentText}>Stripe</Text>
            </View>
            <View style={styles.paymentOption}>
              <FontAwesome name="google-wallet" size={18} color={styles.iconColor.color} />
              <Text style={styles.paymentText}>Google Pay</Text>
            </View>
            <View style={styles.paymentOption}>
              <FontAwesome name="apple" size={18} color={styles.iconColor.color} />
              <Text style={styles.paymentText}>Apple Pay</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.helpLink}>How does the purchase work?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer: Cantidad + Botón “Add to Cart” con loader */}
      <View style={styles.addButtonContainer}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
            disabled={isLoading}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(prev => prev + 1)}
            disabled={isLoading}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, isLoading && { opacity: 0.6 }]}
          onPress={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addButtonText}>
              Add to Cart ${ (finalPrice * quantity).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How does the purchase work?</Text>
            <Text style={styles.modalText}>
              1. Explore the available discounts based on dates and times.
            </Text>
            <Text style={styles.modalText}>
              2. Complete your purchase using Stripe, Google Pay or Apple Pay.
            </Text>
            <Text style={styles.modalText}>
              3. Present your code at the restaurant to redeem your meal at the best price!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 16,
  },
  detailsContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FF6F00',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
  },
  additionalInfoContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333333',
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 5,
  },
  helpLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: '#FF6F00',
    textAlign: 'center',
    marginTop: 8,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  quantityButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 20,
    color: '#333333',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 160,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconColor: {
    color: '#333333',
  },
  backIcon: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333333',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#666666',
  },
  modalButton: {
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default ProductDetail;
