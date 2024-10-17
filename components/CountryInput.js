import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Modal, FlatList, Image, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import countryData from './CountryData';

const PhoneInput = ({ value, onChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryData[0]);
  const [phoneNumber, setPhoneNumber] = useState(value);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const styles = stylesLight;  // Fuerza siempre el uso del modo claro

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    onChange(`${country.dialCode}${phoneNumber}`);
  };

  const handlePhoneChange = (text) => {
    setPhoneNumber(text);
    onChange(`${selectedCountry.dialCode}${text}`);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openModal} style={styles.flagButton}>
        <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
        <FontAwesome name="caret-down" size={16} color="#000" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        onChangeText={handlePhoneChange}
        value={phoneNumber}
        placeholder="Phone Number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
      />
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
      >
        <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
          <View style={styles.modalContainer}>
            <FlatList
              data={countryData}
              keyExtractor={(item, index) => `${item.code}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCountrySelect(item)} style={styles.countryItem}>
                  <Image source={{ uri: item.flag }} style={styles.flagSmall} />
                  <View style={styles.countryTextContainer}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.dialCode}>{item.dialCode}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

// Estilos comunes y estilos para modo claro
const commonStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '93%',
    height: '90%',
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 5,
    borderRadius: 12,
  },
  dialCode: {
    marginRight: 5,
    fontSize: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    height: '70%',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  flagSmall: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 12,
  },
  countryTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  countryName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  flagButton: {
    ...commonStyles.flagButton,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    ...commonStyles.input,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#333',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: '#fff',
  },
  countryItem: {
    ...commonStyles.countryItem,
    borderBottomColor: '#eee',
  },
  closeButton: {
    ...commonStyles.closeButton,
    backgroundColor: '#007AFF',
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#fff',
  },
  dialCode: {
    ...commonStyles.dialCode,
    color: '#000',
  },
  countryName: {
    ...commonStyles.countryName,
    color: '#000',
  },
});

export default PhoneInput;
