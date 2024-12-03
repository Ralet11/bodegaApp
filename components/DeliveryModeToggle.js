import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface DeliveryModeToggleProps {
  deliveryMode: 'Dine-in' | 'Pickup';
  onToggle: (mode: 'Dine-in' | 'Pickup') => void;
}

const DeliveryModeToggle: React.FC<DeliveryModeToggleProps> = ({ deliveryMode, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, deliveryMode === 'Dine-in' && styles.activeButton]}
        onPress={() => onToggle('Dine-in')}
      >
        <FontAwesome5 
          name="utensils" 
          size={14} 
          color={deliveryMode === 'Dine-in' ? '#FFFFFF' : '#333333'} 
        />
        <Text style={[styles.buttonText, deliveryMode === 'Dine-in' && styles.activeButtonText]}>
          Dine-in
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, deliveryMode === 'Pickup' && styles.activeButton]}
        onPress={() => onToggle('Pickup')}
      >
        <FontAwesome5 
          name="shopping-bag" 
          size={14} 
          color={deliveryMode === 'Pickup' ? '#FFFFFF' : '#333333'} 
        />
        <Text style={[styles.buttonText, deliveryMode === 'Pickup' && styles.activeButtonText]}>
          Pickup
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 3,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 17,
  },
  activeButton: {
    backgroundColor: '#FF8C00',
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});

export default DeliveryModeToggle;

