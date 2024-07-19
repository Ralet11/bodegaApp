import React, { useState, useEffect } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet, useColorScheme, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const ModalProduct = ({ visible, onClose, product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState({});
  const scheme = useColorScheme();
  const styles = scheme === 'dark' ? stylesDark : stylesLight;

  useEffect(() => {
    if (visible) {
      setSelectedExtras({});
      setQuantity(1);
    }
  }, [product, visible]);

  const handleAdd = () => {
    const missingRequired = product.extras.some(extra => extra.required && !selectedExtras[extra.name]);
    if (missingRequired) {
      Alert.alert('Error', 'Please select all required options.');
      return;
    }

    const extrasTotalPrice = Object.values(selectedExtras).reduce((total, extra) => {
      return total + (extra && extra.price ? parseFloat(extra.price) : 0);
    }, 0);

    const finalPrice = (parseFloat(product.price) + extrasTotalPrice).toFixed(2);

    addToCart({ ...product, selectedExtras, price: finalPrice }, quantity);
    onClose();
  };

  const handleExtraChange = (extraName, value) => {
    setSelectedExtras(prevState => ({
      ...prevState,
      [extraName]: value ? JSON.parse(value) : null,
    }));
  };

  const renderExtras = () => {
    if (!product.extras) return null;
    return product.extras.map(extra => {
      const validOptions = extra.options.filter(option => option.name !== null);
      return (
        <View key={extra.id} style={styles.extraContainer}>
          <Text style={styles.extraLabel}>
            {extra.name} {extra.required ? '(Required)' : '(Optional)'}:
          </Text>
          <RNPickerSelect
            onValueChange={(itemValue) => handleExtraChange(extra.name, itemValue)}
            items={validOptions.map(option => ({ label: `${option.name} ($${option.price})`, value: JSON.stringify(option) }))}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select an option...', value: null }}
            value={selectedExtras[extra.name] ? JSON.stringify(selectedExtras[extra.name]) : null}
          />
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
          {product && (
            <>
              <Image source={{ uri: product.image }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{product.name}</Text>
              <Text style={styles.modalDescription}>{product.description}</Text>
              <Text style={styles.modalPrice}>${product.price}</Text>
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
    width: '95%',
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
  quantityLabel: {
    ...commonStyles.quantityLabel,
    color: '#fff',
  },
  quantityValue: {
    ...commonStyles.quantityValue,
    color: '#fff',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default ModalProduct;
