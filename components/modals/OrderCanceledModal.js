import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';

const OrderCanceledModal = ({ visible, onClose, modalMessage, onRefund, onAddBalance, isProcessingBalance, balanceAdded, balanceError, buttonsVisible }) => {
  const colorScheme = useColorScheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, colorScheme === 'dark' ? styles.darkModalContent : styles.lightModalContent]}>
          <Text style={[styles.modalTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Order Canceled</Text>
          <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            {modalMessage}
          </Text>
          <View style={styles.modalButtons}>
            {isProcessingBalance ? (
              <View style={styles.centeredLoader}>
                <ActivityIndicator size="large" color="#FFEB3B" />
              </View>
            ) : balanceAdded ? (
              <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}></Text>
            ) : balanceError ? (
              <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
                An error occurred while adding the balance to your account. Please contact support.
              </Text>
            ) : (
              <>
                {buttonsVisible && (
                  <TouchableOpacity style={styles.smallButton} onPress={onRefund}>
                    <Text style={styles.smallButtonText}>Refund</Text>
                  </TouchableOpacity>
                )}
                {buttonsVisible && (
                  <TouchableOpacity style={styles.smallButton} onPress={onAddBalance}>
                    <Text style={styles.smallButtonText}>Credit to Bodega Balance</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
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
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
  },
  smallButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 100, // Asegura un tamaño mínimo de botón
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
});

export default OrderCanceledModal;
