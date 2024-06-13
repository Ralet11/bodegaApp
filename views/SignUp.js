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

export default function Signup() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false
  });

  const [nameLabelAnim] = useState(new Animated.Value(clientData.name ? 1 : 0));
  const [emailLabelAnim] = useState(new Animated.Value(clientData.email ? 1 : 0));
  const [passwordLabelAnim] = useState(new Animated.Value(clientData.password ? 1 : 0));
  const [confirmPasswordLabelAnim] = useState(new Animated.Value(clientData.confirmPassword ? 1 : 0));
  const [phoneLabelAnim] = useState(new Animated.Value(clientData.phone ? 1 : 0));
  const [buttonAnim] = useState(new Animated.Value(1));
  const [formAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    let nameError = false;
    let emailError = false;
    let passwordError = false;
    let confirmPasswordError = false;
    let phoneError = false;

    if (fieldName === 'name') {
      nameError = !value.trim();
      Animated.timing(nameLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'email') {
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
    } else if (fieldName === 'confirmPassword') {
      confirmPasswordError = value !== clientData.password;
      Animated.timing(confirmPasswordLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (fieldName === 'phone') {
      phoneError = !value.trim();
      Animated.timing(phoneLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      phone: phoneError
    });
  };

  const handleSignup = async () => {
    if (errors.name || errors.email || errors.password || errors.confirmPassword || errors.phone) {
      return;
    }

    Animated.timing(buttonAnim, {
      toValue: 0.95, 
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const response = await Axios.post(`${API_URL}/api/auth/registerUser`, {
          clientData,
          credentials: true,
        });

        console.log(response.data);

         if (response.data.error === false) {
           console.log('Registro exitoso');
           const _clientData = response.data;
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
              <Text style={styles.title}>Create Account</Text>
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('name', value)}
                style={[styles.input, { borderColor: errors.name ? 'red' : '#ccc' }]}
                value={clientData.name}
                placeholder='Name'
                placeholderTextColor='#888'
                onFocus={() => Animated.timing(nameLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.name && Animated.timing(nameLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
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
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('confirmPassword', value)}
                style={[styles.input, { borderColor: errors.confirmPassword ? 'red' : '#ccc' }]}
                secureTextEntry={!showConfirmPassword}
                value={clientData.confirmPassword}
                placeholder='Confirm Password'
                placeholderTextColor='#888'
                onFocus={() => Animated.timing(confirmPasswordLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.confirmPassword && Animated.timing(confirmPasswordLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.showPasswordButton}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color="#888" style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('phone', value)}
                style={[styles.input, { borderColor: errors.phone ? 'red' : '#ccc' }]}
                value={clientData.phone}
                placeholder='Phone Number'
                placeholderTextColor='#888'
                onFocus={() => Animated.timing(phoneLabelAnim, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
                onBlur={() => !clientData.phone && Animated.timing(phoneLabelAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }).start()}
              />
            </View>
            <TouchableOpacity onPress={handleSignup} style={styles.button}>
              <Animated.Text style={[styles.buttonText, { transform: [{ scale: buttonAnim }] }]}>Sign Up</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
              <Text style={styles.footerText}>Already have an account? Log in</Text>
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
    borderRadius: 50, // Redondear los bordes de la imagen
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