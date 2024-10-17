// CheckoutConfirmationModal.js

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';

const CheckoutConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  orderType,
  getOrderTypeDisplay,
  deliveryInstructions,
  setDeliveryInstructions,
  addressInfo,
  cart,
  calculateSubtotal,
  serviceFee,
  user,
  originalDeliveryFee,
  deliveryFee,
  calculateTax,
  calculateTotal,
}) => {
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
                {orderType === 'Delivery' ? 'Delivery Address' : 'Order Type'}
              </Text>
              <Text style={[styles.modalText, { color: '#666' }]}>
                {getOrderTypeDisplay(orderType)}
              </Text>
            </View>
            {orderType === 'Delivery' && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: '#000' }]}>
                  Enter Delivery Instructions
                </Text>
                <TextInput
                  style={[
                    styles.instructionsInput,
                    { color: '#000', borderColor: '#e0e0e0' },
                  ]}
                  placeholder="Enter delivery instructions"
                  placeholderTextColor="#A9A9A9"
                  value={deliveryInstructions || addressInfo?.deliveryInstructions}
                  onChangeText={setDeliveryInstructions}
                  multiline
                />
              </View>
            )}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: '#000' }]}>
                Order Summary
              </Text>
              {cart.map((item) => {
                const selectedExtrasArray = Object.values(item.selectedExtras || {}).flat();
                const itemPrice =
                  typeof item.price === 'string'
                    ? parseFloat(item.price.replace('$', ''))
                    : item.price;

                const extrasTotal = selectedExtrasArray.reduce(
                  (extraTotal, extra) =>
                    extraTotal +
                    (typeof extra.price === 'string'
                      ? parseFloat(extra.price.replace('$', ''))
                      : extra.price),
                  0
                );

                const totalPrice = (itemPrice + extrasTotal).toFixed(2);

                return (
                  <View key={item.id} style={styles.cartItem}>
                    <Image source={{ uri: item.image || item.img }} style={styles.cartItemImage} />
                    <View style={styles.cartItemDetails}>
                      <Text style={[styles.cartItemName, { color: '#000' }]}>
                        {item.name}
                      </Text>
                      {selectedExtrasArray.length > 0 && (
                        <View style={styles.cartItemExtras}>
                          {selectedExtrasArray.map((extra, index) => (
                            <Text key={index} style={[styles.cartItemExtraText, { color: '#666' }]}>
                              {extra.name} (${extra.price})
                            </Text>
                          ))}
                        </View>
                      )}
                      <View style={styles.cartItemPriceRow}>
                        <Text style={[styles.cartItemPrice, { color: '#000' }]}>
                          ${totalPrice}
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
                  ${calculateSubtotal()}
                </Text>
              </View>
              {orderType === 'Delivery' && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#000' }]}>
                    Service Fee:
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#000' }]}>
                    ${serviceFee.toFixed(2)}
                  </Text>
                </View>
              )}
              {orderType === 'Delivery' && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#000' }]}>
                    Delivery Fee:
                  </Text>
                  {user.subscription === 1 ? (
                    <View style={styles.feeContainer}>
                      <Text style={[styles.summaryValue, styles.strikethrough, { color: '#000' }]}>
                        ${originalDeliveryFee}
                      </Text>
                      <Text style={[styles.summaryValue, styles.freeText, { color: '#4CAF50' }]}>
                        Free
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.summaryValue, { color: '#000' }]}>
                      ${deliveryFee.toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#000' }]}>
                  Tax:
                </Text>
                {user.subscription === 1 ? (
                  <View style={styles.feeContainer}>
                    <Text style={[styles.summaryValue, styles.strikethrough, { color: '#000' }]}>
                      ${(calculateTax(parseFloat(calculateSubtotal())) * 2).toFixed(2)}
                    </Text>
                    <Text style={[styles.summaryValue, { color: '#000' }]}>
                      ${calculateTax(parseFloat(calculateSubtotal())).toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.summaryValue, { color: '#000' }]}>
                    ${calculateTax(parseFloat(calculateSubtotal())).toFixed(2)}
                  </Text>
                )}
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: '#000' }]}>Total:</Text>
                <Text style={[styles.totalValue, { color: '#000' }]}>
                  ${calculateTotal()}
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: '#FFA500' }]} onPress={onConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: '#f0f0f0' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: '#000' }]}>Cancel</Text>
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
  instructionsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
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
  cartItemExtras: {
    marginBottom: 5,
  },
  cartItemExtraText: {
    fontSize: 14,
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
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginRight: 5,
  },
  freeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
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
