import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, useColorScheme } from 'react-native';

const OrderDetailsModal = ({ visible, onClose, orderDetails, order }) => {
  const colorScheme = useColorScheme();

  const containerStyles = [
    styles.modalContent,
    colorScheme === 'dark' ? styles.darkModalContent : styles.lightModalContent,
  ];

  const textStyles = colorScheme === 'dark' ? styles.darkText : styles.lightText;
  const totalTextStyles = colorScheme === 'dark' ? styles.darkTotalText : styles.lightTotalText;
  const addressContainerStyles = [
    styles.addressContainer,
    colorScheme === 'dark' ? styles.darkAddressContainer : styles.lightAddressContainer,
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={containerStyles}>
          <Text style={[styles.modalTitle, textStyles]}>Order Details</Text>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {orderDetails.map((item) => (
              <View key={item.id} style={styles.detailCard}>
                <Image source={{ uri: item.discount ? item.img : item.image }} style={styles.cartItemImage} />
                <View style={styles.detailInfo}>
                  <Text style={[styles.detailName, textStyles]}>{item.name}</Text>
                  <Text style={[styles.detailPrice, textStyles]}>Price: ${item.price}</Text>
                  <Text style={[styles.detailQuantity, textStyles]}>Quantity: {item.quantity}</Text>
                </View>
              </View>
            ))}
            <View style={styles.summaryContainer}>
              <View style={styles.totalContainer}>
                <Text style={[styles.label, textStyles]}>Total Price:</Text>
                <Text style={[styles.totalText, totalTextStyles]}>
                  ${order.total_price}
                </Text>
              </View>
              <View style={addressContainerStyles}>
                <Text style={[styles.label, textStyles]}>Delivery Address:</Text>
                <Text style={[styles.addressText, textStyles]}>
                  {order.deliveryAddress || 'Pick-Up'}
                </Text>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={[styles.closeButtonText, textStyles]}>Close</Text>
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
    width: '90%', 
    padding: 20,
    borderRadius: 20, 
    alignItems: 'center',
    elevation: 10,
    maxHeight: '80%', 
  },
  lightModalContent: {
    backgroundColor: '#f7f7f7', 
  },
  darkModalContent: {
    backgroundColor: '#333', 
  },
  modalTitle: {
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 20, 
    textAlign: 'center',
  },
  modalScrollContent: {
    paddingBottom: 20,
    width: '100%',
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
    borderBottomWidth: 1,
    borderBottomColor: '#ccc', 
    paddingBottom: 10, 
    width: '100%',
  },
  cartItemImage: {
    width: 70, 
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 5,
  },
  detailPrice: {
    fontSize: 16,
    color: '#666', 
    marginBottom: 5,
  },
  detailQuantity: {
    fontSize: 16,
    color: '#666', 
  },
  summaryContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc', 
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalText: {
    fontSize: 16, 
    fontWeight: 'bold',
  },
  darkTotalText: {
    color: '#ffd700', 
  },
  lightTotalText: {
    color: '#ff8c00', 
  },
  addressContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  lightAddressContainer: {
    backgroundColor: '#eee',
  },
  darkAddressContainer: {
    backgroundColor: '#444',
  },
  addressText: {
    fontSize: 16,
    lineHeight: 22,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20, 
    backgroundColor: '#ff9900', 
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', 
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
});

export default OrderDetailsModal;