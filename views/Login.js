import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Image, Animated, Keyboard, TouchableWithoutFeedback, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { fetchCategories } from '../redux/slices/setUp.slice';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  const [clientData, setClientData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false
  });

  const [emailLabelAnim] = useState(new Animated.Value(clientData.email ? 1 : 0));
  const [passwordLabelAnim] = useState(new Animated.Value(clientData.password ? 1 : 0));
  const [buttonAnim] = useState(new Animated.Value(1));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoAnim, {
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

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/loginguest`);

      if (response.data.error === false) {
        const guestData = response.data;
        dispatch(setUser(guestData));
        dispatch(fetchCategories());
        navigation.navigate('Main');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: response.data.message || 'Unable to login as guest.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colorScheme === 'dark' ? '#333' : '#F2BA25'} />
        <View style={styles.container}>
          <Animated.View style={[styles.header, { opacity: logoAnim, transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
            <LinearGradient
              colors={['#F2BB26', '#F2BB26']}
              style={styles.headerGradient}
            >
              <Image
                source={{ uri: "https://res.cloudinary.com/doqyrz0sg/image/upload/v1724135145/discount/zyc3nulkzjbwzs4u7cvw.jpg" }}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.formContainer, { opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            <Text style={styles.title}>Welcome Back</Text>
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
                autoCapitalize='none'
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
                autoCapitalize='none'
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} />
              </TouchableOpacity>
            </View>
            <View style={styles.rememberForgotContainer}>
              
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLogin} style={styles.signInButton} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Animated.Text style={[styles.signInButtonText, { transform: [{ scale: buttonAnim }] }]}>SIGN IN</Animated.Text>
              )}
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't you have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signUpLink}>Sign Up from here</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleGuestLogin} style={styles.guestLink}>
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Toast />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  header: {
    height: 100,
    width: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 520,
    height: 120,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginRight: 15,  // Adjusted to add more spacing between the icon and the input
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  rememberText: {
    color: '#666',
  },
  forgotText: {
    color: '#F2BA25',
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: '#F2BA25',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666',
    fontSize: 16,
  },
  signUpLink: {
    color: '#F2BA25',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
  guestLink: {
    marginTop: 100,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: '#333',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: "#fff",
  },
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: "#333",
  },
  inputContainer: {
    ...commonStyles.inputContainer,
    backgroundColor: '#555',
    borderColor: '#777',
  },
  input: {
    ...commonStyles.input,
    color: '#FFF',
  },
  title: {
    ...commonStyles.title,
    color: '#FFF',
  },
  icon: {
    marginRight: 15,  // Adjusted to add more spacing between the icon and the input
    color: '#FFF',
  },
  signInButtonText: {
    ...commonStyles.signInButtonText,
    color: '#000',
  },
  footerText: {
    ...commonStyles.footerText,
    color: '#FFF',
  },
});

export default LoginScreen;