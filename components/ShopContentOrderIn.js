import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import colors from './themes/colors';

/**
 * Muestra las categorías y productos (ya filtrados).
 * Aquí NO hacemos el filtrado por `availableFor`; 
 * solo renderizamos el array de `categories` que le llega por props.
 */
const ShopContentOrderIn = ({
  categories = [],
  selectedProduct,
  setSelectedProduct,
  cart,
  handleAddToCart,
  categoryRefs,
  categoryPositions,
  setPositionsReady,
  shop,
}) => {
  const styles = lightStyles;
  const dispatch = useDispatch();
  const categoriesRendered = useRef(0);

  /**
   * Renderizar una tarjeta individual de producto
   */
  const renderProductCard = (product) => {
    // Verificar si el producto está en el carrito y obtener su cantidad
    const cartItem = cart?.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    // Determinar si hay descuento
    const hasDiscount = product.discountPercentage > 0 && product.finalPrice < product.price;
    const originalPrice = parseFloat(product.price);
    const finalPrice = parseFloat(product.finalPrice);

    return (
      <TouchableOpacity
        key={product.id}
        style={styles.productCard}
        onPress={() => setSelectedProduct(product)}
      >
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Si el producto ya está en el carrito, muestra la cantidad */}
        {quantity > 0 && (
          <View style={styles.cartQuantityBadge}>
            <Text style={styles.cartQuantityText}>{quantity}</Text>
          </View>
        )}

        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>

          {/* Si hay descuento, tachar el precio original */}
          {hasDiscount && (
            <View style={styles.priceContainer}>
              <Text style={styles.strikethroughPrice}>
                ${originalPrice.toFixed(2)}
              </Text>
              <View style={styles.discountBadge}>
                <MaterialCommunityIcons
                  name="brightness-percent"
                  size={16}
                  style={{ color: '#FF6F00' }}
                />
                <Text style={styles.discountPercentage}>
                  -{product.discountPercentage}%
                </Text>
              </View>
            </View>
          )}

          {/* Mostrar el precio final */}
          <Text style={styles.finalPrice}>${finalPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Renderizar los productos de una categoría en filas de 2
   */
  const renderProductsByCategory = (products) => {
    if (!products || products.length === 0) return null;

    const rows = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(products.slice(i, i + 2));
    }

    return (
      <View style={styles.productSectionContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.productRow}>
            {row.map((product) => renderProductCard(product))}
          </View>
        ))}
      </View>
    );
  };

  /**
   * Renderizar una categoría y sus productos
   */
  const renderCategory = (category, index) => (
    <View
      key={category.id}
      style={styles.categoryContainer}
      ref={(el) => {
        if (el) categoryRefs.current[index] = el;
      }}
      onLayout={(event) => {
        const { y } = event.nativeEvent.layout;
        categoryPositions.current[index] = y;
        categoriesRendered.current += 1;

        // Cuando terminamos de medir TODAS las categorías:
        if (categoriesRendered.current === categories.length) {
          setPositionsReady(true);
        }
      }}
    >
      <Text style={styles.categoryTitle}>{category.name}</Text>
      {renderProductsByCategory(category.products)}
    </View>
  );

  // Si no hay `shop`, no renderiza
  if (!shop) {
    console.log('El objeto shop no está disponible en este momento.');
    return null;
  }

  return (
    <View style={{ padding: 5, paddingBottom: 50 }}>
      {categories.map((category, index) => renderCategory(category, index))}
    </View>
  );
};

export default ShopContentOrderIn;

// Estilos base
const commonStyles = {
  productCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    marginHorizontal: '2.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productDetails: {
    padding: 10,
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
  },
  // Precios
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 12,
    textAlign: 'left',
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    textAlign: 'left',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  discountPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 5,
    textAlign: 'left',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  categoryContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
  },
  productSectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartQuantityBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  cartQuantityText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

const lightStyles = StyleSheet.create({
  ...commonStyles,
});
