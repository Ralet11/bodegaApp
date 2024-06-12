import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  const handleSendEmail = () => {
    if (name && email && message) {
      const options = {
        recipients: ['support@example.com'],
        subject: 'Contact Form Inquiry',
        body: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      };

      MailComposer.composeAsync(options)
        .then((result) => {
          if (result.status === 'sent') {
            Alert.alert('Success', 'Email sent successfully');
            setName('');
            setEmail('');
            setMessage('');
          } else {
            Alert.alert('Failed', 'Email not sent');
          }
        })
        .catch((error) => {
          Alert.alert('Error', 'An error occurred while sending the email');
        });
    } else {
      Alert.alert('Error', 'Please fill out all fields');
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
          <FontAwesome name="arrow-left" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Contact Us</Text>
      </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    marginTop: 30,
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
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Contact;