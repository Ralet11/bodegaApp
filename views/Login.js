import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Animated, StyleSheet, Dimensions, Image, Keyboard, TouchableWithoutFeedback, ActivityIndicator, useColorScheme, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { fetchCategories } from '../redux/slices/setUp.slice';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;
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
  const [imageAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(imageAnim, {
      toValue: 1,
      duration: 1000,
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
      if (errors.email) {
        Toast.show({
          type: 'error',
          text1: 'Email Error',
          text2: 'Please enter a valid email address.',
        });
      }

      if (errors.password) {
        Toast.show({
          type: 'error',
          text1: 'Password Error',
          text2: 'Please enter a valid password.',
        });
      }

      return;
    }

    setLoading(true);
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

        if (response.data.error === false) {
          const _clientData = response.data;
          dispatch(setUser(_clientData));
          dispatch(fetchCategories());
          navigation.navigate('Main');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Error',
            text2: response.data.message || 'Invalid Username or password.',
          });
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
        });
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? '#333' : '#F2BA25'} />
        <View style={styles.container}>
          <Animated.View style={[styles.formContainer, { opacity: formAnim }]}>
            <Animated.View style={[styles.logoContainer, {
              opacity: imageAnim,
              transform: [{
                translateY: imageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0]
                })
              }]
            }]}>
              <Image
                source={{ uri: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1717527579/WhatsApp_Image_2024-05-25_at_17.24.54_lpri1m.jpg" }}
                style={styles.logo}
              />
            </Animated.View>
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('email', value)}
                style={[styles.input, { borderColor: errors.email ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
                value={clientData.email}
                placeholder='Email Address'
                placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
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
              <FontAwesome name="lock" size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('password', value)}
                style={[styles.input, { borderColor: errors.password ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
                secureTextEntry={!showPassword}
                value={clientData.password}
                placeholder='Password'
                placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
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
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Animated.Text style={[styles.buttonText, { transform: [{ scale: buttonAnim }] }]}>Log In</Animated.Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.footerLink}>
              <Text style={styles.footerText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Toast />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const commonStyles = {
  safeArea: {
    flex: 1,
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
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.9, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowRadius: 20, 
    elevation: 50, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 300,
    height: 120,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 15, 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.4, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowRadius: 20, 
    elevation: 15, 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: "#F2BA25",
  },
  formContainer: {
    ...commonStyles.formContainer,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  input: {
    ...commonStyles.input,
    color: '#333',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#000',
  },
  footerText: {
    ...commonStyles.footerText,
    color: '#333',
  },
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: "#333",
  },
  formContainer: {
    ...commonStyles.formContainer,
    backgroundColor: '#444',
  },
  input: {
    ...commonStyles.input,
    color: '#FFF',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#000',
  },
  footerText: {
    ...commonStyles.footerText,
    color: '#FFF',
  },
});