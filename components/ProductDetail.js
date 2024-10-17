import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
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
  console.log(shop, "shopp22")
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  // Check if the product has a valid price, if not set a default value
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
      if (selectedOptions[extraId] === option) {
        delete newOptions[extraId];
      } else {
        newOptions[extraId] = option;
      }
    } else {
      if (!newOptions[extraId]) {
        newOptions[extraId] = [];
      }

      const optionIndex = newOptions[extraId].findIndex(selectedOption => selectedOption.name === option.name);

      if (optionIndex > -1) {
        newOptions[extraId].splice(optionIndex, 1);
        if (newOptions[extraId].length === 0) {
          delete newOptions[extraId];
        }
      } else {
        newOptions[extraId].push(option);
      }
    }

    setSelectedOptions(newOptions);

    const extrasTotalPrice = Object.values(newOptions).reduce(
      (total, opt) =>
        total +
        (Array.isArray(opt) ? opt.reduce((sum, item) => sum + parseFloat(item.price || 0), 0) : parseFloat(opt.price || 0)),
      0
    );

    setCurrentPrice((parseFloat(productPrice) + extrasTotalPrice).toFixed(2));
  };

  // Handle adding to cart, ensuring all required extras are selected
  const handleAddToCart = () => {
    const selectedExtras = selectedOptions;

    const requiredExtras = product.extras.filter(extra => extra.required);
    for (const extra of requiredExtras) {
      if (!selectedExtras[extra.id] || (Array.isArray(selectedExtras[extra.id]) && selectedExtras[extra.id].length === 0)) {
        Alert.alert('Required Option', `Please select an option for "${extra.name}" before adding to the cart.`);
        return;
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

    onBack(); 
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
          <Text style={styles.productPrice}>${currentPrice}</Text>
        </View>

        {product.extras && product.extras.length > 0 && (
          <View style={styles.extrasContainer}>
            {product.extras.map(extra => (
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

        <View style={styles.additionalInfoContainer}>
          <Text style={styles.subTitle}>Available only for:</Text>
          <View style={styles.optionsRow}>
            <View style={styles.option}>
              <MaterialCommunityIcons name="walk" size={20} color={styles.iconColor.color} />
              <Text style={styles.optionText}>PickUp</Text>
            </View>
          </View>
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

      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart ${currentPrice}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for purchase info */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
          
            <Text style={styles.modalTitle}>How does the purchase work?</Text>
            <Text style={styles.modalText}>1. Explore the available discounts based on dates and times.</Text>
            <Text style={styles.modalText}>2. Complete your purchase using Stripe, Google pay or Apple pay.</Text>
            <Text style={styles.modalText}>3. Present your code at the restaurant to redeem your meal at the best price!</Text>
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
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  extrasContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 16,
  },
  extraSection: {
    marginBottom: 10,
  },
  extraTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  requiredText: {
    fontSize: 12,
    color: '#FF0000',
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  additionalInfoContainer: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginVertical: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentText: {
    fontSize: 14,
    color: '#000000',
  },
  helpLink: {
  
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#FF6F00',
    textAlign: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  addButton: {
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 16,
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
    color: '#000000',
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
  modalImage: {
    width: '80%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 100,
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
    backgroundColor: '#1E1E1E',
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  extrasContainer: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 16,
  },
  extraSection: {
    marginBottom: 10,
  },
  extraTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  requiredText: {
    fontSize: 12,
    color: '#FF5555',
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#555555',
    marginBottom: 5,
  },
  selectedOptionButton: {
    backgroundColor: '#333333',
  },
  optionText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  additionalInfoContainer: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  helpLink: {
    fontSize: 14,
    textDecorationLine: 'underline',
    color: '#FFA000',
    textAlign: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderColor: '#2A2A2A',
  },
  addButton: {
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFC107',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconColor: {
    color: '#FFFFFF',
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
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalImage: {
    width: '80%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#CCCCCC',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#000000',
    fontSize: 16,
  },
});

export default ProductDetail;
