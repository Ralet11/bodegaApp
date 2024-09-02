import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, useColorScheme } from 'react-native';

const SelectAddressModal = ({
  visible,
  onClose,
  addresses,
  onSelectAddress,
}) => {
  const colorScheme = useColorScheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.modalContent, 
          colorScheme === 'dark' ? styles.darkModalContent : styles.lightModalContent
        ]}>
          <Text style={[styles.modalTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            Select Delivery Address
          </Text>
          <View style={styles.addressListContainer}>
            <FlatList
              data={addresses}
              keyExtractor={(item) => item.adressID?.toString() || item.id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.addressItem}
                  onPress={() => onSelectAddress(item)}
                >
                  <Text style={[styles.addressText, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                    {item.formatted_address}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, colorScheme === 'dark' ? styles.darkCloseButtonText : styles.lightCloseButtonText]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  lightModalContent: {
    backgroundColor: '#fff',
  },
  darkModalContent: {
    backgroundColor: '#1c1c1c',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  addressListContainer: {
    maxHeight: 300, // Limita la altura máxima para permitir el scroll si es necesario
    width: '100%',  // Asegura que la lista ocupe todo el ancho disponible
  },
  addressItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addressText: {
    fontSize: 18,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lightCloseButtonText: {
    color: '#007bff',
  },
  darkCloseButtonText: {
    color: '#ff9900', // Texto naranja para el botón de cerrar en modo oscuro
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
});

export default SelectAddressModal;