// ProductDetail.js

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity } from '../redux/slices/cart.slice';
import { FontAwesome } from '@expo/vector-icons';

const ProductDetail = ({ product, onAddToCart, onBack }) => {
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const cart = useSelector(state => state.cart.items);

  // Verifica si el producto tiene un precio válido, si no, establece un valor predeterminado
  const productPrice = parseFloat(product?.price) || 0;

  // States for managing selected options and total price
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentPrice, setCurrentPrice] = useState(productPrice.toFixed(2));

  // Initialize options and price when component loads
  useEffect(() => {
    setSelectedOptions({});
    setCurrentPrice(productPrice.toFixed(2));
  }, [product, productPrice]);

  // Handle selection of extra options
  const handleSelectOption = (extraId, option) => {
    let newOptions = { ...selectedOptions };

    const extra = product.extras.find(extra => extra.id === extraId);

    if (extra.onlyOne) {
      // Si onlyOne es true, se reemplaza la opción seleccionada
      if (selectedOptions[extraId] === option) {
        delete newOptions[extraId];
      } else {
        newOptions[extraId] = option;
      }
    } else {
      // Si onlyOne es false, se permite la selección múltiple
      if (!newOptions[extraId]) {
        newOptions[extraId] = [];
      }
      
      const optionIndex = newOptions[extraId].findIndex(selectedOption => selectedOption.name === option.name);

      if (optionIndex > -1) {
        newOptions[extraId].splice(optionIndex, 1); // Desselecciona la opción si ya estaba seleccionada
        if (newOptions[extraId].length === 0) {
          delete newOptions[extraId]; // Elimina el array si está vacío
        }
      } else {
        newOptions[extraId].push(option); // Agrega la nueva opción
      }
    }

    setSelectedOptions(newOptions);

    // Recalcula el precio total sumando las opciones seleccionadas
    const extrasTotalPrice = Object.values(newOptions).reduce(
      (total, opt) => total + (Array.isArray(opt) ? opt.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) : parseFloat(opt.price || 0)),
      0
    );

    setCurrentPrice((parseFloat(productPrice) + extrasTotalPrice).toFixed(2));
  };

  // Check if two extras objects are equal (deep comparison)
  const areExtrasEqual = (extras1, extras2) => {
    if (!extras1 || !extras2) return false;
    const keys1 = Object.keys(extras1);
    const keys2 = Object.keys(extras2);
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      const option1 = extras1[key];
      const option2 = extras2[key];
      if (Array.isArray(option1) && Array.isArray(option2)) {
        if (option1.length !== option2.length) return false;
        for (let i = 0; i < option1.length; i++) {
          if (option1[i].name !== option2[i].name || option1[i].price !== option2[i].price) {
            return false;
          }
        }
      } else if (!option2 || option1.name !== option2.name || option1.price !== option2.price) {
        return false;
      }
    }
    return true;
  };

  // Handle adding to cart, ensuring all required extras are selected
  const handleAddToCart = () => {
    const selectedExtras = selectedOptions;

    // Check if all required extras are selected
    const requiredExtras = product.extras.filter(extra => extra.required);
    for (const extra of requiredExtras) {
      if (!selectedExtras[extra.id] || (Array.isArray(selectedExtras[extra.id]) && selectedExtras[extra.id].length === 0)) {
        Alert.alert("Opción Requerida", `Por favor selecciona una opción para "${extra.name}" antes de agregar al carrito.`);
        return; // Stop execution if a required extra is not selected
      }
    }

    const existingProduct = cart.find(item => {
      return item.id === product.id && areExtrasEqual(item.selectedExtras, selectedExtras);
    });

    if (existingProduct) {
      dispatch(incrementQuantity(existingProduct.id));
    } else {
      dispatch(addToCart({ 
        ...product, 
        quantity: 1, 
        selectedExtras, 
        price: currentPrice,
        currentPrice,
      }));
    }

    onBack(); // Return to ShopScreen after adding to cart
  };

  return (
    <ScrollView style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <FontAwesome name="arrow-left" size={24} color={styles.backIcon.color} />
      </TouchableOpacity>

      {/* Imagen del producto */}
      <Image source={{ uri: product.image }} style={styles.image} />

      {/* Información del producto */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <Text style={styles.productPrice}>${currentPrice}</Text>
      </View>

      {/* Sección para mostrar los extras del producto */}
      {product.extras && product.extras.length > 0 && (
        <View style={styles.extrasContainer}>
          {product.extras.map((extra) => (
            <View key={extra.id} style={styles.extraSection}>
              <View style={styles.extraTitleContainer}>
                <Text style={styles.extraTitle}>{extra.name}</Text>
                {extra.required && <Text style={styles.requiredText}>(requerido)</Text>}
              </View>
              {extra.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    (Array.isArray(selectedOptions[extra.id])
                      ? selectedOptions[extra.id].some(selectedOption => selectedOption.name === option.name)
                      : selectedOptions[extra.id] === option) && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleSelectOption(extra.id, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (Array.isArray(selectedOptions[extra.id])
                        ? selectedOptions[extra.id].some(selectedOption => selectedOption.name === option.name)
                        : selectedOptions[extra.id] === option) && styles.selectedOptionText,
                    ]}
                  >
                    {option.name} (+${parseFloat(option.price || 0).toFixed(2)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.additionalInfoContainer}>
        <Text style={styles.subTitle}>Disponible solo para:</Text>
        <View style={styles.optionsRow}>
          <View style={styles.option}>
            <FontAwesome name="cutlery" size={20} color={styles.iconColor.color} />
            <Text style={styles.optionText}>Dine-in</Text>
          </View>
        </View>
        <Text style={styles.subTitle}>Métodos de pago:</Text>
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
        <TouchableOpacity>
          <Text style={styles.helpLink}>¿Cómo funciona la compra?</Text>
        </TouchableOpacity>
      </View>

      {/* Botón para agregar al carrito */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Agregar ${currentPrice}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Estilos comunes
const commonStyles = {
  container: {
    flex: 1,
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
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  extrasContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  extraSection: {
    marginBottom: 10,
  },
  extraTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requiredText: {
    fontSize: 12,
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 5,
  },
  selectedOptionButton: {},
  optionText: {
    fontSize: 14,
  },
  selectedOptionText: {},
  additionalInfoContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  option: {
    alignItems: 'center',
    marginTop: 10,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentOption: {
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    marginTop: 4,
  },
  helpLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  addButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  addButton: {
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconColor: {
    color: '#000',
  },
  backIcon: {
    color: '#fff',
  },
};

// Estilos para modo claro
const lightStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#FFFFFF',
  },
  detailsContainer: {
    ...commonStyles.detailsContainer,
    backgroundColor: '#FFFFFF',
  },
  productName: {
    ...commonStyles.productName,
    color: '#000000',
  },
  productDescription: {
    ...commonStyles.productDescription,
    color: '#666666',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#000000',
  },
  extrasContainer: {
    ...commonStyles.extrasContainer,
    backgroundColor: '#FFFFFF',
  },
  extraTitle: {
    ...commonStyles.extraTitle,
    color: '#000000',
  },
  requiredText: {
    ...commonStyles.requiredText,
    color: '#FF0000',
  },
  optionButton: {
    ...commonStyles.optionButton,
    borderColor: '#CCCCCC',
  },
  selectedOptionButton: {
    backgroundColor: '#E0E0E0',
  },
  optionText: {
    ...commonStyles.optionText,
    color: '#333333',
  },
  selectedOptionText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  additionalInfoContainer: {
    ...commonStyles.additionalInfoContainer,
    backgroundColor: '#F9F9F9',
  },
  subTitle: {
    ...commonStyles.subTitle,
    color: '#000000',
  },
  paymentText: {
    ...commonStyles.paymentText,
    color: '#000000',
  },
  helpLink: {
    ...commonStyles.helpLink,
    color: '#FF6F00',
  },
  addButtonContainer: {
    ...commonStyles.addButtonContainer,
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
  },
  addButton: {
    ...commonStyles.addButton,
    backgroundColor: '#000000',
  },
  addButtonText: {
    ...commonStyles.addButtonText,
    color: '#FFFFFF',
  },
  backButton: {
    ...commonStyles.backButton,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  iconColor: {
    color: '#000000',
  },
  backIcon: {
    color: '#FFFFFF',
  },
});

// Estilos para modo oscuro
const darkStyles = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  detailsContainer: {
    ...commonStyles.detailsContainer,
    backgroundColor: '#1E1E1E',
  },
  productName: {
    ...commonStyles.productName,
    color: '#FFFFFF',
  },
  productDescription: {
    ...commonStyles.productDescription,
    color: '#CCCCCC',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#FFFFFF',
  },
  extrasContainer: {
    ...commonStyles.extrasContainer,
    backgroundColor: '#1E1E1E',
  },
  extraTitle: {
    ...commonStyles.extraTitle,
    color: '#FFFFFF',
  },
  requiredText: {
    ...commonStyles.requiredText,
    color: '#FF5555',
  },
  optionButton: {
    ...commonStyles.optionButton,
    borderColor: '#555555',
  },
  selectedOptionButton: {
    backgroundColor: '#333333',
  },
  optionText: {
    ...commonStyles.optionText,
    color: '#CCCCCC',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  additionalInfoContainer: {
    ...commonStyles.additionalInfoContainer,
    backgroundColor: '#1E1E1E',
  },
  subTitle: {
    ...commonStyles.subTitle,
    color: '#FFFFFF',
  },
  paymentText: {
    ...commonStyles.paymentText,
    color: '#FFFFFF',
  },
  helpLink: {
    ...commonStyles.helpLink,
    color: '#FFA000',
  },
  addButtonContainer: {
    ...commonStyles.addButtonContainer,
    backgroundColor: '#121212',
    borderColor: '#2A2A2A',
  },
  addButton: {
    ...commonStyles.addButton,
    backgroundColor: '#FFC107',
  },
  addButtonText: {
    ...commonStyles.addButtonText,
    color: '#000000',
  },
  backButton: {
    ...commonStyles.backButton,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconColor: {
    color: '#FFFFFF',
  },
  backIcon: {
    color: '#FFFFFF',
  },
});

export default ProductDetail;
