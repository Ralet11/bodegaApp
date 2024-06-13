import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated, StyleSheet, Dimensions, Image, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { fetchCategories } from '../redux/slices/setUp.slice';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [clientData, setClientData] = useState({
    email: "ramiro@gmail.com",
    password: "123456"
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false
  });

  const [emailLabelAnim] = useState(new Animated.Value(clientData.email ? 1 : 0));
  const [passwordLabelAnim] = useState(new Animated.Value(clientData.password ? 1 : 0));
  const [buttonAnim] = useState(new Animated.Value(1));
  const [formAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleChange = (fieldName, value) => {
    setClientData(prevState => ({
      ...prevState,
      [fieldName]: value,
    }));

    let emailError = false;
    let passwordError = false;

    if (fieldName === 'email') {
      emailError = !value.trim() || !/^\S+@\S+\.\S+$/.test(value);
      Animated.timing(emailLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'password') {
      passwordError = !value.trim();
      Animated.timing(passwordLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    setErrors({
      ...errors,
      email: emailError,
      password: passwordError
    });
  };

  const handleLogin = async () => {
    if (errors.email || errors.password) {
      return;
    }

    Animated.timing(buttonAnim, {
      toValue: 0.95, 
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const response = await Axios.post(`${API_URL}/api/auth/loginUser`, {
          clientData,
          credentials: true,
        });

        console.log(response.data);

         if (response.data.error === false) {
           console.log('Inicio de sesión exitoso');
           const _clientData = response.data;
           console.log(_clientData.data.client.id, "info del cliente");
           dispatch(setUser(_clientData));
           dispatch(fetchCategories());
           navigation.navigate(`Main`);
         } else {
           console.log('Error en la respuesta del servidor:', response.data);
           Animated.timing(buttonAnim, {
             toValue: 1,
             duration: 200,
             useNativeDriver: true,
           }).start();
         }
      } catch (error) {
        console.log(error);
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View style={[styles.formContainer, { opacity: formAnim }]}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1717527579/WhatsApp_Image_2024-05-25_at_17.24.54_lpri1m.jpg" }}
                style={styles.logo}
              />
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#888" style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('email', value)}
                style={[styles.input, { borderColor: errors.email ? 'red' : '#ccc' }]}
                value={clientData.email}
                placeholder='Email Address'
                placeholderTextColor='#888'
                onFocus={() => Animated.timing(emailLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.email && Animated.timing(emailLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('password', value)}
                style={[styles.input, { borderColor: errors.password ? 'red' : '#ccc' }]}
                secureTextEntry={!showPassword}
                value={clientData.password}
                placeholder='Password'
                placeholderTextColor='#888'
                onFocus={() => Animated.timing(passwordLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.password && Animated.timing(passwordLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Animated.Text style={[styles.buttonText, { transform: [{ scale: buttonAnim }] }]}>Log In</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
              <Text style={styles.footerText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2BA25",
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 30, // Redondear los bordes de la imagen
    borderWidth: 3, // Ancho del borde
    borderColor: '#fff', // Color del borde
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  showPasswordButton: {
    padding: 10,
  },
  button: {
    backgroundColor: "#FFC300",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#333',
    fontSize: 16,
  },
});