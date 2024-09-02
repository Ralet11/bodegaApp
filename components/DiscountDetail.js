import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity } from '../redux/slices/cart.slice';
import { stylesDark, stylesLight } from '../components/themeShop';

const DiscountDetail = ({ discount, onAddToCart, onBack }) => {
  const styles = useColorScheme() === 'dark' ? stylesDark : stylesLight;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentPrice, setCurrentPrice] = useState('0');
  const cart = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const calculateDiscountedPrice = (price, percentage) => {
    const discountAmount = (price * percentage) / 100;
    return (price - discountAmount).toFixed(2).toString(); // Convertir a string
  };

  useEffect(() => {
    setSelectedOptions({});
    setCurrentPrice(calculateDiscountedPrice(discount.product.price, discount.percentage));
  }, [discount]);

  const handleSelectOption = (extraId, option) => {
    let newOptions = { ...selectedOptions };

    if (selectedOptions[extraId] === option) {
      delete newOptions[extraId];
    } else {
      newOptions[extraId] = option;
    }

    setSelectedOptions(newOptions);

    const extrasTotalPrice = Object.values(newOptions).reduce(
      (total, opt) => total + (opt ? parseFloat(opt.price) : 0),
      0
    );

    setCurrentPrice((parseFloat(calculateDiscountedPrice(discount.product.price, discount.percentage)) + extrasTotalPrice).toFixed(2).toString());
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

    // Verificar si todos los extras requeridos están seleccionados
    const requiredExtras = discount.product.extras.filter(extra => extra.required);
    for (const extra of requiredExtras) {
      if (!selectedExtras[extra.id]) {
        Alert.alert("Required Option", `Please select an option for "${extra.name}" before adding to the cart.`);
        return; // Detiene la ejecución si falta seleccionar un extra requerido
      }
    }

    const existingProduct = cart.find(item => {
      return item.id === discount.product.id && areExtrasEqual(item.selectedExtras, selectedExtras);
    });

    if (existingProduct) {
      dispatch(incrementQuantity(existingProduct.id));
    } else {
      dispatch(addToCart({ 
        ...discount.product, 
        quantity: 1, 
        selectedExtras, 
        price: calculateDiscountedPrice(discount.product.price, discount.percentage), 
        currentPrice,
        discount: true // Añadir este parámetro
      }));
    }

    onBack();
  };

  return (
    <View key={discount.id} style={styles.productDetailContainer}>
      <Image source={{ uri: discount.product.img || discount.product.image }} style={styles.productDetailImage} />
      <Text style={styles.productDetailName}>{discount.product.name}</Text>
      <Text style={styles.productDetailDescription}>{discount.product.description}</Text>

      {discount.product.extras && discount.product.extras.length > 0 && (
        <View style={styles.extrasContainer}>
          {discount.product.extras.map((extra) => (
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

export default DiscountDetail;