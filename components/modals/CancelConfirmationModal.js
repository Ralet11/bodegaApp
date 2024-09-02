import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';

const CancelConfirmationModal = ({ visible, onClose, onConfirm }) => {
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
          <Text style={[styles.modalTitle, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>Confirm Cancellation</Text>
          <Text style={[styles.modalMessage, colorScheme === 'dark' ? styles.darkText : styles.lightText]}>
            Are you sure you want to cancel your order?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.smallButton} onPress={onConfirm}>
              <Text style={styles.smallButtonText}>Yes, Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={onClose}>
              <Text style={styles.smallButtonText}>No, Go Back</Text>
            </TouchableOpacity>
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
  darkText: {
    color: '#fff',
  },
  lightText: {
    color: '#000',
  },
});

export default CancelConfirmationModal;
