import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';

const CheckoutConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  orderType,
  cart,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  // Se elimina calculateSavings ya que ahora se calcula internamente
}) => {
  const subtotal = calculateSubtotal();
  const taxAmt = calculateTax(subtotal);
  const total = calculateTotal();
  // Calcular los savings usando originalPrice y finalPrice
  const savings = cart.reduce((totalSavings, item) => {
    const original = Number(item.price) || 0;
    const final = Number(item.finalPrice) || 0;
    const diff = original - final;
    return totalSavings + (diff > 0 ? diff * item.quantity : 0);
  }, 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#fff' }]}>
          <Text style={[styles.modalTitle, { color: '#000' }]}>
            Confirm Your Order
          </Text>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: '#000' }]}>
                Order Type
              </Text>
              <Text style={[styles.modalText, { color: '#666' }]}>
                {orderType}
              </Text>
            </View>
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: '#000' }]}>
                Order Summary
              </Text>
              {cart.map((item) => {
                // Se usa finalPrice para calcular el precio final
                const itemFinalPrice =
                  typeof item.finalPrice === 'string'
                    ? parseFloat(item.finalPrice.replace('$', ''))
                    : item.finalPrice;
                const totalPrice = itemFinalPrice * item.quantity;
                return (
                  <View key={item.id} style={styles.cartItem}>
                    <Image
                      source={{ uri: item.image || item.img }}
                      style={styles.cartItemImage}
                    />
                    <View style={styles.cartItemDetails}>
                      <Text style={[styles.cartItemName, { color: '#000' }]}>
                        {item.name}
                      </Text>
                      <View style={styles.cartItemPriceRow}>
                        <Text style={[styles.cartItemPrice, { color: '#000' }]}>
                          ${totalPrice.toFixed(2)}
                        </Text>
                        <Text style={[styles.cartItemQuantity, { color: '#666' }]}>
                          Qty: {item.quantity}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#000' }]}>
                  Subtotal:
                </Text>
                <Text style={[styles.summaryValue, { color: '#000' }]}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#000' }]}>
                  Tax (8%):
                </Text>
                <Text style={[styles.summaryValue, { color: '#000' }]}>
                  ${taxAmt.toFixed(2)}
                </Text>
              </View>
              {savings > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#000' }]}>
                    Savings:
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                    -${savings.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: '#000' }]}>
                  Total:
                </Text>
                <Text style={[styles.totalValue, { color: '#000' }]}>
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: '#FFA500' }]}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: '#f0f0f0' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: '#000' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScrollView: {
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 15,
  },
  cartItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  cartItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemQuantity: {
    fontSize: 14,
  },
  summaryContainer: {
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CheckoutConfirmationModal;
