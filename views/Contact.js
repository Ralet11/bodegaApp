import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();
  const token = useSelector((state) => state.user.userInfo.data.token);

  const handleSendEmail = async () => {
    if (name && email && message) {
      const data = { name, email, message };
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await Axios.post(`${API_URL}/api/contact/sendContactAppMail`, data, { headers });
        if (response.status === 200) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Your inquiry was sent successfully!'
          });
          // Clear the input fields
          setName('');
          setEmail('');
          setMessage('');
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'There was an error sending your inquiry.'
        });
      }
    } else {
      Alert.alert('Error', 'Please fill out all fields');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <FontAwesome name="arrow-left" size={24} color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Contact Us</Text>
      </View>
      <Text style={[styles.description, isDarkMode && styles.descriptionDark]}>
        You can send us an email with your inquiry, and we will get back to you shortly.
      </Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Name"
        placeholderTextColor="#A9A9A9"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Email"
        placeholderTextColor="#A9A9A9"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.textArea, isDarkMode && styles.textAreaDark]}
        placeholder="Message"
        placeholderTextColor="#A9A9A9"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  containerDark: {
    backgroundColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  goBackButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  titleDark: {
    color: '#fff',
  },
  description: {
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  descriptionDark: {
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#444',
    borderColor: '#888',
    color: '#fff',
  },
  textArea: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  textAreaDark: {
    backgroundColor: '#444',
    borderColor: '#888',
    color: '#fff',
  },
  button: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Contact;