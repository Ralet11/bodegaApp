import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ProductDetail from '../components/ProductDetail';
import DiscountDetail from '../components/DiscountDetail';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'react-native';

const ShopContentOrderIn = ({
  selectedProduct,
  setSelectedProduct,
  selectedDiscount,
  setSelectedDiscount,
  cart,
  discounts,
  handleAddToCart,
  handleAddDiscountToCart,
  selectedOptions,
  setSelectedOptions,
  closeProductDetail,
  closeDiscountDetail,
  orderType,
  categoryRefs,
  categoryPositions,
  setPositionsReady,
  shop
}) => {
  const styles =lightStyles;
  const dispatch = useDispatch();
  const categoriesRendered = useRef(0);



  console.log(cart, "cart")

  // Renderizado de la card de descuento
  const renderDiscount = (discount) => {
    // Verificar si el producto está en el carrito y obtener su cantidad
    const cartItem = cart.find(item => item.id === discount.product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
  
    return (
      <TouchableOpacity 
        key={discount.id} 
        style={styles.discountCard} 
        onPress={() => {
          console.log('Discount seleccionado:', discount);
          console.log('Shop en el momento de seleccionar un descuento:', shop); // Verificar que shop sigue definido aquí
          setSelectedDiscount(discount);
        }}
      >
        <Image source={{ uri: discount.product.img }} style={styles.discountImage} />
  
        {/* Círculo amarillo con la cantidad si el producto está en el carrito */}
        {quantity > 0 && (
          <View style={styles.cartQuantityBadge}>
            <Text style={styles.cartQuantityText}>{quantity}</Text>
          </View>
        )}
  
        <View style={styles.discountDetails}>
          <Text style={styles.discountProduct}>{discount.productName}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.strikethroughPrice}>${discount.product.price.toFixed(2)}</Text>
            <View style={styles.discountBadge}>
              <MaterialCommunityIcons
                name="brightness-percent"
                size={16}
                style={{ color: '#FF6F00' }}
              />
              <Text style={styles.discountPercentage}>-{discount.percentage}%</Text>
            </View>
          </View>
          <Text style={styles.discountPrice}>
            ${((discount.product.price * (100 - discount.percentage)) / 100).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizado de los descuentos en fila
  const renderDiscounts = (discounts) => {
    if (discounts.length === 0) return null;

    const discountRows = [];
    for (let i = 0; i < discounts.length; i += 2) {
      discountRows.push(discounts.slice(i, i + 2));
    }

    return (
      <View style={styles.discountSectionContainer}>
        {discountRows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.discountRow}>
            {row.map((discount) => renderDiscount(discount))}
          </View>
        ))}
      </View>
    );
  };

  // Renderizado de la categoría
  const renderCategory = (category, index) => (
    <View
      key={category.category.id}
      style={styles.categoryContainer}
      ref={(el) => {
        if (el) {
          categoryRefs.current[index] = el;
        }
      }}
      onLayout={(event) => {
        const { y } = event.nativeEvent.layout;
        categoryPositions.current[index] = y;
        categoriesRendered.current += 1;

        console.log(`Posición de la categoría ${index} guardada: ${y}`);

        if (categoriesRendered.current === discounts.length) {
          setPositionsReady(true);
        }
      }}
    >
      <Text style={styles.categoryTitle}>{category.category.name}</Text>
      {renderDiscounts(category.discounts)}
    </View>
  );

  // Verifica que 'shop' esté definido antes de renderizar el componente DiscountDetail
  if (!shop) {
    console.log('El objeto shop no está disponible en este momento.');
    return null; // No renderices nada hasta que shop esté disponible.
  }

  return (
    <>
     
        <View style={{ padding: 5, paddingBottom: 50 }}>
          {discounts?.map((category, index) => renderCategory(category, index))}
        </View>
    
    </>
  );
};

export default ShopContentOrderIn;

// Estilos personalizados
const commonStyles = {
  discountCard: {
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
  discountImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  discountDetails: {
    padding: 10,
    alignItems: 'flex-start',
  },
  discountProduct: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'left',
  },
  strikethroughPrice: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontSize: 12,
    textAlign: 'left',
  },
  discountPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginLeft: 5,
    textAlign: 'left',
  },
  discountPrice: {
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
  discountSectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
 cartQuantityBadge: {
    position: 'absolute',
    top: -4, // Desplaza hacia afuera de la card
    right: -2, // Desplaza hacia afuera de la card
    backgroundColor: '#FFD700', // Color amarillo
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    zIndex: 1,
  },
  cartQuantityText: {
    color: '#000', // Texto negro
    fontWeight: 'bold',
    fontSize: 16,
  },
};

// Estilos para el tema claro y oscuro
const lightStyles = StyleSheet.create({
  ...commonStyles,
  discountCard: {
    ...commonStyles.discountCard,
    backgroundColor: '#fff',
  },
  discountDetails: {
    ...commonStyles.discountDetails,
    backgroundColor: '#f9f9f9',
  },
  discountProduct: {
    ...commonStyles.discountProduct,
    color: '#333',
  },
  discountPrice: {
    ...commonStyles.discountPrice,
    color: '#333',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#333',
  },
});

const darkStyles = StyleSheet.create({
  ...commonStyles,
  discountCard: {
    ...commonStyles.discountCard,
    backgroundColor: '#444',
  },
  discountDetails: {
    ...commonStyles.discountDetails,
    backgroundColor: '#555',
  },
  discountProduct: {
    ...commonStyles.discountProduct,
    color: '#fff',
  },
  discountPrice: {
    ...commonStyles.discountPrice,
    color: '#fff',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#fff',
  },
});
