import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const styles = stylesLight;

  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  const [clientData, setClientData] = useState({
    email: '',
    password: ''
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

  // Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '446223706539-i8b0j8tasvjm66luvhvt67gtgjl4h41a.apps.googleusercontent.com',
    expoClientId: '446223706539-u2lnq90ruft4lk7onsp9dmot8dh811eb.apps.googleusercontent.com',
    iosClientId: '446223706539-f18kn0300m6l69q9ccj3j4lj27q51att.apps.googleusercontent.com',
    scopes: ['profile', 'email']
  });

  // Forgot password steps
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();

    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication);
    }
  }, [response]);

  const handleGoogleLogin = async (authentication) => {
    try {
      const userInfoResponse = await Axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` }
      });
      const userInfo = userInfoResponse.data;

      const backendResponse = await Axios.post(`${API_URL}/api/auth/googleLogin`, {
        userInfo
      });

      if (backendResponse.data.error === false) {
        const _clientData = backendResponse.data;
        dispatch(setUser(_clientData));
        navigation.navigate('Main');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: backendResponse.data.message || 'Server error.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Something went wrong.'
      });
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });
      // Usamos el identityToken como token para el backend
      const backendResponse = await Axios.post(`${API_URL}/api/auth/appleLogin`, {
        token: credential.identityToken,
      });
  
      if (backendResponse.data.error === false) {
        const _clientData = backendResponse.data;
        dispatch(setUser(_clientData));
        dispatch(fetchCategories());
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }]
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: backendResponse.data.message || 'Server error.'
        });
      }
    } catch (error) {
      if (error.code !== 'ERR_CANCELED') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong with Apple Login.'
        });
      }
    }
  };

  const handleChange = (fieldName, value) => {
    setClientData((prevState) => ({
      ...prevState,
      [fieldName]: value
    }));

    let emailError = false;
    let passwordError = false;

    if (fieldName === 'email') {
      emailError = !value.trim() || !/^\S+@\S+\.\S+$/.test(value);
      Animated.timing(emailLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true
      }).start();
    } else if (fieldName === 'password') {
      passwordError = !value.trim();
      Animated.timing(passwordLabelAnim, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: true
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
          text2: 'Please enter a valid email address.'
        });
      }
      if (errors.password) {
        Toast.show({
          type: 'error',
          text1: 'Password Error',
          text2: 'Please enter a valid password.'
        });
      }
      return;
    }

    setLoading(true);
    Animated.timing(buttonAnim, {
      toValue: 0.95,
      duration: 200,
      useNativeDriver: true
    }).start(async () => {
      try {
        const response = await Axios.post(`${API_URL}/api/auth/loginUser`, {
          clientData,
          credentials: true
        });

        if (response.data.error === false) {
          const _clientData = response.data;
          dispatch(setUser(_clientData));
          navigation.navigate('Main');
        } else {
          Toast.show({
            type: 'error',
            text1: 'Login Error',
            text2: response.data.message || 'Invalid username or password.'
          });
          Animated.timing(buttonAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start();
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Network Error',
          text2: error.response?.data?.message || error.message || 'Please try again later.'
        });
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
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
        navigation.navigate('Main');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: response.data.message || 'Unable to login as guest.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Network Error',
        text2: error.response?.data?.message || error.message || 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotPasswordEmail = async () => {
    if (!forgotEmail || !/^\S+@\S+\.\S+$/.test(forgotEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid email address.'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/user/forgotPasswordEmail`, {
        email: forgotEmail
      });

      // Check "success" from backend
      if (response.data.success) {
        setForgotPasswordStep(2);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'A code has been sent to your email.'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Could not send the code.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter the code.'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/user/verifyResetCode`, {
        email: forgotEmail,
        code: resetCode
      });

      // Check "success" from backend
      if (response.data.success) {
        setForgotPasswordStep(3);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Invalid code.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match or are invalid.'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/auth/user/resetPassword`, {
        email: forgotEmail,
        code: resetCode,
        newPassword
      });

      // Check "success" from backend
      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Password updated. Please log in.'
        });
        setForgotPasswordStep(0);
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.data.message || 'Could not reset password.'
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
            backgroundColor={colorScheme === 'dark' ? '#333' : '#F2BA25'}
          />
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.container}>
              <Animated.View
                style={[
                  styles.header,
                  {
                    opacity: logoAnim,
                    transform: [
                      {
                        translateY: logoAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0]
                        })
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient colors={['#F2BB26', '#F2BB26']} style={styles.headerGradient}>
                  <Image
                    source={{
                      uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1728602580/WhatsApp_Image_2024-08-31_at_14.14.14_jhjq2g.jpg'
                    }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </LinearGradient>
              </Animated.View>

              {/* STEP 0: Normal Login */}
              {forgotPasswordStep === 0 && (
                <Animated.View
                  style={[
                    styles.formContainer,
                    {
                      opacity: formAnim,
                      transform: [
                        {
                          translateY: formAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.infoText}>
                    Please sign in with your registered email and password, or choose an alternative login method below.
                  </Text>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="envelope" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      onChangeText={(value) => handleChange('email', value)}
                      style={[styles.input, styles.inputLarge, { borderColor: errors.email ? 'red' : '#ccc' }]}
                      value={clientData.email}
                      placeholder="Email Address"
                      placeholderTextColor="#888"
                      onFocus={() =>
                        Animated.timing(emailLabelAnim, {
                          toValue: 1,
                          duration: 200,
                          useNativeDriver: true
                        }).start()
                      }
                      onBlur={() =>
                        !clientData.email &&
                        Animated.timing(emailLabelAnim, {
                          toValue: 0,
                          duration: 200,
                          useNativeDriver: true
                        }).start()
                      }
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      onChangeText={(value) => handleChange('password', value)}
                      style={[styles.input, styles.inputLarge, { borderColor: errors.password ? 'red' : '#ccc' }]}
                      secureTextEntry={!showPassword}
                      value={clientData.password}
                      placeholder="Password"
                      placeholderTextColor="#888"
                      onFocus={() =>
                        Animated.timing(passwordLabelAnim, {
                          toValue: 1,
                          duration: 200,
                          useNativeDriver: true
                        }).start()
                      }
                      onBlur={() =>
                        !clientData.password &&
                        Animated.timing(passwordLabelAnim, {
                          toValue: 0,
                          duration: 200,
                          useNativeDriver: true
                        }).start()
                      }
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
                      <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={20} color="#888" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rememberForgotContainer}>
                    <TouchableOpacity onPress={() => setForgotPasswordStep(1)}>
                      <Text style={styles.forgotText}>Forgot the Password?</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={handleLogin} style={styles.signInButton} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Animated.Text style={[styles.signInButtonText, { transform: [{ scale: buttonAnim }] }]}>
                        SIGN IN
                      </Animated.Text>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.orText}>or login with</Text>

                  <View style={styles.socialContainer}>
                    <TouchableOpacity onPress={() => promptAsync()} style={[styles.socialButton, styles.googleButtonBg]}>
                      <FontAwesome name="google" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAppleLogin} style={[styles.socialButton, styles.appleButtonBg]}>
                      <FontAwesome name="apple" size={30} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't you have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                      <Text style={styles.signUpLink}>Sign Up from here</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={handleGuestLogin} style={styles.guestLink}>
                    <Text style={styles.guestText}>Continue as Guest</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* STEP 1: Request Email to Reset Password */}
              {forgotPasswordStep === 1 && (
                <View style={[styles.formContainer]}>
                  <Text style={styles.title}>Recover Password</Text>
                  <Text style={styles.infoText}>Enter the email associated with your account, and we'll send you a reset code.</Text>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="envelope" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={[styles.input, styles.inputLarge]}
                      placeholder="Enter your email"
                      placeholderTextColor="#888"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity onPress={handleSendForgotPasswordEmail} style={styles.signInButton} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.signInButtonText}>SEND CODE</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setForgotPasswordStep(0)} style={styles.guestLink}>
                    <Text style={styles.guestText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 2: Verify Code */}
              {forgotPasswordStep === 2 && (
                <View style={[styles.formContainer]}>
                  <Text style={styles.title}>Enter the Code</Text>
                  <Text style={styles.infoText}>We sent a verification code to your email. Please enter that 6-digit code here.</Text>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={[styles.input, styles.inputLarge]}
                      placeholder="Code"
                      placeholderTextColor="#888"
                      value={resetCode}
                      onChangeText={setResetCode}
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity onPress={handleVerifyCode} style={styles.signInButton} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.signInButtonText}>VERIFY CODE</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setForgotPasswordStep(0)} style={styles.guestLink}>
                    <Text style={styles.guestText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 3: Reset Password */}
              {forgotPasswordStep === 3 && (
                <View style={[styles.formContainer]}>
                  <Text style={styles.title}>New Password</Text>
                  <Text style={styles.infoText}>
                    Please create a new password. Make sure it's something secure that you can remember.
                  </Text>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={[styles.input, styles.inputLarge]}
                      placeholder="Enter new password"
                      placeholderTextColor="#888"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color="#888" style={styles.icon} />
                    <TextInput
                      style={[styles.input, styles.inputLarge]}
                      placeholder="Confirm new password"
                      placeholderTextColor="#888"
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      secureTextEntry
                      autoCapitalize="none"
                    />
                  </View>

                  <TouchableOpacity onPress={handleResetPassword} style={styles.signInButton} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.signInButtonText}>SUBMIT</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setForgotPasswordStep(0)} style={styles.guestLink}>
                    <Text style={styles.guestText}>Back to Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
          <Toast />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1
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
    elevation: 5
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 520,
    height: 120
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  icon: {
    marginRight: 15
  },
  input: {
    flex: 1,
    fontSize: 16
  },
  inputLarge: {
    height: 60 // Make inputs taller
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30
  },
  forgotText: {
    color: '#F2BA25',
    fontWeight: 'bold'
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
    shadowRadius: 10
  },
  signInButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 10,
    fontSize: 16
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  socialButton: {
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    width: 60,
    height: 60
  },
  googleButtonBg: {
    backgroundColor: '#DB4437'
  },
  appleButtonBg: {
    backgroundColor: '#000'
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  signUpText: {
    color: '#666',
    fontSize: 16
  },
  signUpLink: {
    color: '#F2BA25',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5
  },
  guestLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  guestText: {
    fontSize: 16,
    textDecorationLine: 'underline',
    color: '#333'
  },
  showPasswordButton: {
    padding: 8
  }
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff'
  }
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#333'
  },
  inputContainer: {
    ...commonStyles.inputContainer,
    backgroundColor: '#555',
    borderColor: '#777'
  },
  input: {
    ...commonStyles.input,
    color: '#FFF'
  },
  title: {
    ...commonStyles.title,
    color: '#FFF'
  },
  icon: {
    marginRight: 15,
    color: '#FFF'
  },
  signInButtonText: {
    ...commonStyles.signInButtonText,
    color: '#000'
  }
});

export default LoginScreen;
