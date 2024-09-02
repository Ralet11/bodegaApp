import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, useColorScheme, Image, Animated, Keyboard, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { fetchCategories } from '../redux/slices/setUp.slice';
import PhoneInput from '../components/CountryInput';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Signup() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

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
  const [imageAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    let nameError = false;
    let emailError = false;
    let passwordError = false;
    let confirmPasswordError = false;
    let phoneError = false;

    if (fieldName === 'name') {
      nameError = !value.trim() || value.length > 45;
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
      passwordError = !value.trim() || value.length < 6;
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
    const currentErrors = {
      name: !clientData.name.trim() || clientData.name.length > 45,
      email: !clientData.email.trim() || !/^\S+@\S+\.\S+$/.test(clientData.email),
      password: !clientData.password.trim() || clientData.password.length < 6,
      confirmPassword: clientData.confirmPassword !== clientData.password,
      phone: !clientData.phone.trim(),
    };

    setErrors(currentErrors);

    if (Object.values(currentErrors).some(error => error)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fix the errors in the form before submitting.',
      });
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

        if (response.data.error === false) {
          const _clientData = response.data;
          dispatch(setUser(_clientData));
          dispatch(fetchCategories());
          navigation.navigate('Main');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.data.message || 'Error in server response.',
          });
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } catch (error) {
        const backendErrors = error.response?.data?.errors || {};
        setErrors({
          name: backendErrors.name || currentErrors.name,
          email: backendErrors.email || currentErrors.email,
          password: backendErrors.password || currentErrors.password,
          confirmPassword: backendErrors.confirmPassword || currentErrors.confirmPassword,
          phone: backendErrors.phone || currentErrors.phone,
        });

        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || error.message || 'Something went wrong. Please try again later.',
        });
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
          <Animated.View style={[styles.header, { opacity: imageAnim, transform: [{ translateY: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
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
            <Text style={styles.title}>Create Your Account</Text>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('name', value)}
                style={[styles.input, { borderColor: errors.name ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
                value={clientData.name}
                placeholder='Name'
                placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
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
            {errors.name && <Text style={styles.errorText}>Name is required and must be less than 45 characters.</Text>}
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
            {errors.email && <Text style={styles.errorText}>Valid email is required.</Text>}
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
            {errors.password && <Text style={styles.errorText}>Password is required and must be at least 6 characters.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="lock" size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} style={styles.icon} />
              <TextInput
                onChangeText={(value) => handleChange('confirmPassword', value)}
                style={[styles.input, { borderColor: errors.confirmPassword ? 'red' : colorScheme === 'dark' ? '#FFF' : '#ccc' }]}
                secureTextEntry={!showConfirmPassword}
                value={clientData.confirmPassword}
                placeholder='Confirm Password'
                placeholderTextColor={colorScheme === 'dark' ? '#FFF' : '#888'}
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
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>Passwords do not match.</Text>}
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color={colorScheme === 'dark' ? '#FFF' : '#888'} style={styles.icon} />
              <PhoneInput
                value={clientData.phone}
                onChange={(value) => handleChange('phone', value)}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneInputTextContainer}
                textInputStyle={styles.phoneInputText}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>Valid phone number is required.</Text>}
            <TouchableOpacity onPress={handleSignup} style={styles.signInButton}>
              <Animated.Text style={[styles.signInButtonText, { transform: [{ scale: buttonAnim }] }]}>Sign Up</Animated.Text>
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't you have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signUpLink}>Sign Up from here</Text>
              </TouchableOpacity>
            </View>
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
    alignItems: 'center'
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
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
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  phoneInputContainer: {
    flex: 1,
    height: 50, // Ajusta la altura del input
    borderBottomWidth: 1,
    borderBottomColor: '#888',
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0, // Elimina cualquier padding adicional
  },
  phoneInputText: {
    color: '#333',
    fontSize: 16,
    height: 50, // Asegura que la altura del texto coincida con el contenedor
    paddingVertical: 10, // Ajusta el padding para centrar el texto verticalmente
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
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  forgotText: {
    color: '#F2BA25',
    fontWeight: 'bold',
  }
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
  phoneInputContainer: {
    ...commonStyles.phoneInputContainer,
    borderBottomColor: '#FFF',
  },
  phoneInputText: {
    ...commonStyles.phoneInputText,
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
  errorText: {
    ...commonStyles.errorText,
    color: 'red',
  },
  title: {
    ...commonStyles.title,
    color: '#FFF',
  },
  signUpText: {
    ...commonStyles.signUpText,
    color: '#FFF',
  },
  signInButtonText: {
    ...commonStyles.signInButtonText,
    color: '#000',
  },
});