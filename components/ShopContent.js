import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import ProductDetail from '../components/ProductDetail';
import DiscountDetail from '../components/DiscountDetail';
import { stylesDark, stylesLight } from '../components/themeShop';
import { useDispatch } from 'react-redux';
import { incrementQuantity, decrementQuantity } from '../redux/slices/cart.slice';

const ShopContent = ({
  selectedProduct,
  setSelectedProduct,
  selectedDiscount,
  setSelectedDiscount,
  categories,
  cart,
  discounts,
  handleAddToCart,
  handleAddDiscountToCart,
  selectedOptions,
  setSelectedOptions,
  scrollToCategory,
  scrollViewRef,
  categoryListY,
  setCategoryListY,
  closeProductDetail,
  closeDiscountDetail,
  categoryRefs,
  categoryPositions,
  setPositionsReady,
  orderType,
  selectedCategory,
  setSelectedCategory,
}) => {
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;
  const iconColor = '#000000'; // Icon color based on theme
  const dispatch = useDispatch();
  const categoriesRendered = useRef(0);

  useEffect(() => {
    if (categoriesRendered.current === categories.length) {
      setPositionsReady(true);
    }
  }, [categories]);

  const renderProduct = (product) => {
    const productInCart = cart?.find((cartItem) => cartItem?.id === product?.id);

    const handleIncrementQuantity = () => {
      if (product.extras && product.extras.length > 0) {
        setSelectedProduct(product);
      } else {
        if (productInCart) {
          dispatch(incrementQuantity(product?.id));
        } else {
          handleAddToCart(product, 1);
        }
      }
    };

    const handleDecrementQuantity = () => {
      if (productInCart && productInCart.quantity > 1) {
        dispatch(decrementQuantity(product?.id));
      } else if (productInCart && productInCart.quantity === 1) {
        dispatch(decrementQuantity(product?.id));
      }
    };

    return (
      <View key={product.id} style={styles.productCard}>
        <TouchableOpacity onPress={() => setSelectedProduct(product)}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </TouchableOpacity>
        <View style={styles.productDetails}>
          <TouchableOpacity onPress={() => setSelectedProduct(product)}>
            <Text style={styles.productName}>{product.name}</Text>
          </TouchableOpacity>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.productPriceContainer}>
            <Text style={styles.productPrice}>${product.price}</Text>
            <View style={styles.productActions}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrementQuantity}
              >
                <FontAwesome name="minus" size={14} color={iconColor} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>
                {productInCart ? productInCart.quantity : 0}
              </Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrementQuantity}
              >
                <FontAwesome name="plus" size={14} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCategory = (category, index) => (
    <View
      key={category.id}
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

        if (categoriesRendered.current === categories.length) {
          setPositionsReady(true);
        }
      }}
    >
      <Text style={styles.categoryTitle}>{category.name}</Text>
      {category.products.map((product) => renderProduct(product))}
    </View>
  );

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    categoryPositions.current.forEach((position, index) => {
      if (
        position <= scrollY + categoryListY + 10 &&
        (categoryPositions.current[index + 1] === undefined ||
          categoryPositions.current[index + 1] > scrollY + categoryListY + 10)
      ) {
        setSelectedCategory(index);
      }
    });
  };

  const renderDiscount = (discount) => (
    <View key={discount.id} style={styles.discountCard}>
      <Image source={{ uri: discount.product.img }} style={styles.discountImage} />
      <View style={styles.discountDetails}>
        <Text style={styles.discountProduct}>{discount.productName}</Text>
        <Text style={styles.discountDescription}>{discount.product.description}</Text>
        <Text style={styles.discountPrice}>
          $
          {(
            (discount.product.price * (100 - discount.percentage)) /
            100
          ).toFixed(2)}{' '}
          <Text style={{ textDecorationLine: 'line-through', color: '#999' }}>
            ${discount.product.price.toFixed(2)}
          </Text>
        </Text>
        <Text style={styles.discountPercentage}>{discount.percentage}% OFF</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddDiscountToCart(discount)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiscounts = () => {
    const filteredDiscounts = discounts.filter(
      (discount) =>
        discount.delivery ===
        (orderType === 'Order-in' ? 0 : orderType === 'Pick-up' ? 1 : 2)
    );

    if (filteredDiscounts.length === 0) return null;

    return (
      <View style={styles.discountSectionContainer}>
        <Text style={styles.discountSectionTitle}>Discounts</Text>
        {filteredDiscounts.map((discount) => renderDiscount(discount))}
      </View>
    );
  };

  return (
    <View style={{padding: 20}}>
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
        <ScrollView
          ref={scrollViewRef}
          nestedScrollEnabled={true}
          style={styles.scrollView}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {renderDiscounts()}
          {categories.map((category, index) => renderCategory(category, index))}
        </ScrollView>
      )}
    </View>
  );
};

export default ShopContent;
