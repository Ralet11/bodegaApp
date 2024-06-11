import React, { useState } from 'react';
import { View, Text, Image, Modal, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';

const ModalProduct = ({ visible, onClose, product, addToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [specifications, setSpecifications] = useState('');
  const scheme = useColorScheme();
  const styles = scheme === 'dark' ? stylesDark : stylesLight;

  const handleAdd = () => {
    addToCart({ ...product, specifications }, quantity);
    onClose();
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
              <Text style={styles.modalPrice}>{product.price}</Text>
              <TextInput
                style={styles.input}
                placeholder="Specifications"
                placeholderTextColor={scheme === 'dark' ? '#aaa' : '#666'}
                value={specifications}
                onChangeText={setSpecifications}
              />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeIconText: {
    fontSize: 24,
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
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
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 20,
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
  input: {
    ...commonStyles.input,
    borderColor: '#ccc',
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
  input: {
    ...commonStyles.input,
    borderColor: '#555',
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

export default ModalProduct;