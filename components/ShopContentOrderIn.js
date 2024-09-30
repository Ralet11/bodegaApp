  import React, { useRef } from 'react';
  import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
  import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
  import ProductDetail from '../components/ProductDetail';
  import DiscountDetail from '../components/DiscountDetail';
  import { useDispatch } from 'react-redux';
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
  }) => {
    const styles = useColorScheme() === 'dark' ? darkStyles : lightStyles;
    const dispatch = useDispatch();

    const categoriesRendered = useRef(0);

    const renderDiscount = (discount) => (
      <View key={discount.id} style={styles.discountCard}>
        <TouchableOpacity onPress={() => setSelectedDiscount(discount)}>
          <Image source={{ uri: discount.product.img }} style={styles.discountImage} />
        </TouchableOpacity>
        <View style={styles.discountDetails}>
          <TouchableOpacity onPress={() => setSelectedDiscount(discount)}>
            <Text style={styles.discountProduct}>{discount.productName}</Text>
          </TouchableOpacity>

          <View style={styles.priceContainer}>
            <Text style={styles.discountPrice}>
              ${((discount.product.price * (100 - discount.percentage)) / 100).toFixed(2)}
            </Text>
            <Text style={styles.strikethroughPrice}>
              ${discount.product.price.toFixed(2)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <MaterialCommunityIcons
              name="brightness-percent"
              size={16}
              style={{ color: '#FF6F00', marginTop: 5 }}
            />
            <Text style={styles.discountPercentage}>-{discount.percentage}%</Text>
          </View>
        </View>
      </View>
    );

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

          console.log(`Posición de la categoría ${index} almacenada: ${y}`);

          if (categoriesRendered.current === discounts.length) {
            setPositionsReady(true);
          }
        }}
      >
        <Text style={styles.categoryTitle}>{category.category.name}</Text>
        {renderDiscounts(category.discounts)}
      </View>
    );

    return (
      <>
        {selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={closeProductDetail}
          />
        ) : selectedDiscount ? (
          <DiscountDetail
            discount={selectedDiscount}
            onAddToCart={handleAddDiscountToCart}
            onBack={closeDiscountDetail}
          />
        ) : (
          <>
            {discounts?.map((category, index) => renderCategory(category, index))}
          </>
        )}
      </>
    );
  };

  export default ShopContentOrderIn;

  // Estilos personalizados basados en el diseño solicitado
  const commonStyles = {
    discountCard: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 10,
      marginHorizontal: '1%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    discountImage: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    discountDetails: {
      padding: 10,
    },
    discountProduct: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 5,
    },
    discountDescription: {
      fontSize: 12,
      color: '#666',
      marginBottom: 5,
    },
    discountPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
    },
    strikethroughPrice: {
      textDecorationLine: 'line-through',
      color: '#999',
      fontSize: 12,
      marginLeft: 10,
    },
    discountPercentage: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FF6F00',
      marginTop: 5,
    },
    discountBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    categoryContainer: {
      marginVertical: 10,
      paddingHorizontal: 10,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 10,
    },
    discountSectionContainer: {
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    discountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    addButton: {
      marginTop: 10,
      backgroundColor: '#8C6D00',
      paddingVertical: 8,
      borderRadius: 5,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  };

  // Estilos para modo claro y oscuro
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
    discountDescription: {
      ...commonStyles.discountDescription,
      color: '#666',
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
    discountDescription: {
      ...commonStyles.discountDescription,
      color: '#ccc',
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
