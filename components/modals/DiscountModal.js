import React, { useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/slices/cart.slice';

const combineProductAndDiscount = (product, discount) => {
  const discountedPrice = discount.discountType === 'percentage'
    ? product.price - (product.price * discount.percentage / 100)
    : product.price - discount.fixedValue;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.img,
    price: discountedPrice.toFixed(2), // Format the price as a string with a dollar sign
    quantity: 1, // Default quantity to 1
    discount: true,
    discountId: discount.id,
    discountType: discount.delivery,
  };
};

const ModalDiscount = ({ visible, onClose, discount }) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState({});
  const scheme = useColorScheme();
  const styles = scheme === 'dark' ? stylesDark : stylesLight;

  const handleAdd = () => {
    const missingRequired = discount.product.extras.some(extra => extra.required && !selectedExtras[extra.name]);
    if (missingRequired) {
      Alert.alert('Error', 'Please select all required options.');
      return;
    }
    const productWithDiscount = combineProductAndDiscount(discount.product, discount);
    dispatch(addToCart({ ...productWithDiscount, selectedExtras, quantity }));
    onClose();
  };

  const handleExtraChange = (extraName, value) => {
    setSelectedExtras({ ...selectedExtras, [extraName]: value });
  };

  const renderExtras = () => {
    if (!discount.product.extras) return null;
    return discount.product.extras.map(extra => {
      const validOptions = extra.options.filter(option => option.name !== null);
      return (
        <View key={extra.id} style={styles.extraContainer}>
          <Text style={styles.extraLabel}>
            {extra.name} {extra.required ? '(Required)' : '(Optional)'}:
          </Text>
          <Picker
            selectedValue={selectedExtras[extra.name]}
            onValueChange={(itemValue) => handleExtraChange(extra.name, itemValue)}
            style={styles.extraPicker}
          >
            <Picker.Item label="Select an option..." value={null} />
            {validOptions.map((option, index) => (
              <Picker.Item key={index} label={`${option.name} ($${option.price})`} value={option} />
            ))}
          </Picker>
        </View>
      );
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
            <Text style={styles.closeIconText}>×</Text>
          </TouchableOpacity>
          {discount && discount.product && (
            <>
              <Image source={{ uri: discount.product.img }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{discount.product.name}</Text>
              <Text style={styles.modalDescription}>{discount.product.description}</Text>
              <Text style={styles.modalPrice}>${discount.product.price}</Text>
              <Text style={styles.modalDiscount}>Discount: {discount.description}</Text>
              {renderExtras()}
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity:</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.quantityButton}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const commonStyles = {
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    width: '95%', // Aumentar el tamaño del modal
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  closeIconText: {
    fontSize: 24,
  },
  modalImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  modalPrice: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalDiscount: {
    fontSize: 16,
    marginBottom: 20,
    color: '#ff0000',
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  quantityButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quantityValue: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: '#ffcc00',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  extraContainer: {
    width: '100%',
    marginBottom: 10,
  },
  extraLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  extraPicker: {
    height: 40,
    width: '100%',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  modalView: {
    ...commonStyles.modalView,
    backgroundColor: 'white',
  },
  closeIconText: {
    ...commonStyles.closeIconText,
    color: '#000',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#000',
  },
  modalDescription: {
    ...commonStyles.modalDescription,
    color: '#666',
  },
  modalPrice: {
    ...commonStyles.modalPrice,
    color: '#000',
  },
  modalDiscount: {
    ...commonStyles.modalDiscount,
    color: '#ff0000',
  },
  quantityLabel: {
    ...commonStyles.quantityLabel,
    color: '#000',
  },
  quantityValue: {
    ...commonStyles.quantityValue,
    color: '#000',
  },
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  modalView: {
    ...commonStyles.modalView,
    backgroundColor: '#333',
  },
  closeIconText: {
    ...commonStyles.closeIconText,
    color: '#fff',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#fff',
  },
  modalDescription: {
    ...commonStyles.modalDescription,
    color: '#aaa',
  },
  modalPrice: {
    ...commonStyles.modalPrice,
    color: '#fff',
  },
  modalDiscount: {
    ...commonStyles.modalDiscount,
    color: '#ff9999',
  },
  quantityLabel: {
    ...commonStyles.quantityLabel,
    color: '#fff',
  },
  quantityValue: {
    ...commonStyles.quantityValue,
    color: '#fff',
  },
});

export default ModalDiscount;
