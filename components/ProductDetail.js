import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { stylesDark, stylesLight } from '../components/themeShop';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity } from '../redux/slices/cart.slice';

const ProductDetail = ({ product, onAddToCart, onBack }) => {
  const styles = useColorScheme() === 'dark' ? stylesDark : stylesLight;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedOptions({});
    setCurrentPrice(product.price);
  }, [product]);

  const handleSelectOption = (extraId, option) => {
    setSelectedOptions((prevState) => ({
      ...prevState,
      [extraId]: option,
    }));

    const extrasTotalPrice = Object.values({ ...selectedOptions, [extraId]: option }).reduce(
      (total, opt) => total + (opt ? parseFloat(opt.price) : 0),
      0
    );

    setCurrentPrice((parseFloat(product.price) + extrasTotalPrice).toFixed(2).toString());
  };

  const areExtrasEqual = (extras1, extras2) => {
    if (!extras1 || !extras2) return false;
    const keys1 = Object.keys(extras1);
    const keys2 = Object.keys(extras2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const option1 = extras1[key];
      const option2 = extras2[key];
      if (!option2 || option1.name !== option2.name || option1.price !== option2.price) {
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    const selectedExtras = selectedOptions;

    // Verificar si un producto con los mismos extras ya está en el carrito
    const existingProduct = cart.find(item => {
      return item.id === product.id && areExtrasEqual(item.selectedExtras, selectedExtras);
    });

    if (existingProduct) {
      // Si el producto con los mismos extras ya está en el carrito, incrementar la cantidad
      dispatch(incrementQuantity(existingProduct.id));
    } else {
      // Si no, agregarlo como un nuevo producto en el carrito
      dispatch(addToCart({ ...product, quantity: 1, selectedExtras }));
    }

    onBack();
  };

  return (
    <View key={product.id} style={styles.productDetailContainer}>
      <Image source={{ uri: product.image }} style={styles.productDetailImage} />
      <Text style={styles.productDetailName}>{product.name}</Text>
      <Text style={styles.productDetailDescription}>{product.description}</Text>

      {product.extras && product.extras.length > 0 && (
        <View style={styles.extrasContainer}>
          {product.extras.map((extra) => (
            <View key={extra.id} style={styles.extraSection}>
              <View style={styles.extraTitleContainer}>
                <Text style={styles.extraTitle}>{extra.name}</Text>
                {extra.required && <Text style={styles.requiredText}>(required)</Text>}
              </View>
              {extra.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOptions[extra.id] === option && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleSelectOption(extra.id, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOptions[extra.id] === option && styles.selectedOptionText,
                    ]}
                  >
                    {option.name} (+${option.price})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      <View style={styles.productDetailActions}>
        <Text style={styles.productDetailPrice}>Total: ${currentPrice}</Text>
        <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetail;