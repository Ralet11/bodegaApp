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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity } from '../redux/slices/cart.slice';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const ProductDetail = ({ product, onAddToCart, onBack, shop }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);

  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Convert to float with fallback
  const originalPrice = parseFloat(product?.price) || 0;
  const finalPrice = parseFloat(product?.finalPrice) || originalPrice;

  const handleAddToCart = () => {
    setIsLoading(true);

    // Simulate a short delay to show the loader
    setTimeout(() => {
      const existingProduct = cart.find((item) => item.id === product.id);
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
    }, 1500);
  };

  // Always show both options: "Dine-in" and "Pick-up"
  const renderAlwaysBothOptions = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={20}
        color={styles.iconColor.color}
      />
      <Text style={styles.optionText}>Dine-in</Text>
      <View style={{ width: 10 }} />
      <MaterialCommunityIcons
        name="walk"
        size={20}
        color={styles.iconColor.color}
      />
      <Text style={styles.optionText}>Pick-up</Text>
    </View>
  );

  // Show preparation time as "Between X and X+5 minutes"
  const renderPreparationTime = () => {
    if (!product.preparationTime) return null;
    const prepTime = parseInt(product.preparationTime, 10);
    return (
      <View style={styles.prepContainer}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={20}
          color={styles.iconColor.color}
        />
        <Text style={styles.prepText}>
          Ready in {prepTime}-{prepTime + 5} min
        </Text>
      </View>
    );
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
              <Text style={styles.originalPrice}>
                ${originalPrice.toFixed(2)}
              </Text>
              <Text style={styles.discountBadge}>
                -{product.discountPercentage}%
              </Text>
            </View>
          )}

          <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.additionalInfoContainer}>
          <Text style={styles.subTitle}>Available for:</Text>
          <View style={styles.optionsRow}>{renderAlwaysBothOptions()}</View>

          {renderPreparationTime()}
        </View>
      </ScrollView>

      {/* Footer: Quantity + “Add to Cart” Button with loader */}
      <View style={styles.addButtonContainer}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            disabled={isLoading}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity((prev) => prev + 1)}
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
    </View>
  );
};

// Light theme styles
const styles = StyleSheet.create({
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
  optionText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333333',
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
  prepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  prepText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ProductDetail;
