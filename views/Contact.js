import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
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
    <LinearGradient colors={['#FFDEE9', '#B5FFFC']} style={styles.linearGradient}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
              <FontAwesome name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Contact Us</Text>
          </View>
          <Text style={styles.description}>
            You can send us an email with your inquiry, and we will get back to you shortly.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#A9A9A9"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.textArea}
            placeholder="Message"
            placeholderTextColor="#A9A9A9"
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
            <LinearGradient colors={['#FFC107', '#FFAA00']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Send</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Toast />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  buttonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Contact;
