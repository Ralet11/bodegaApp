import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView, useColorScheme, Animated, Modal, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import Axios from 'react-native-axios/lib/axios';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const BodegaPro = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [confirmCancelModalVisible, setConfirmCancelModalVisible] = useState(false);
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(true);
  const isSubscribed = user?.subscription === 1;
  const benefits = [
    'Free shipping',
    '50% off on tax',
    'Exclusive promotions',
    // Add more benefits here
  ];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const payment = async () => {
    const finalPrice = (9.99 * 100);
    setIsCheckoutLoading(true);

    try {
      const response = await Axios.post(`${API_URL}/api/payment/bodegaProSub`, {
        priceId: 'price_1PdJs5CtqRjqS5chUBi4PyDI'
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { clientSecret } = response.data;
      const paymentIntentId = clientSecret.split('_secret')[0];

      const initResponse = await initPaymentSheet({
        merchantDisplayName: "Bodega+",
        paymentIntentClientSecret: clientSecret,
      });

      if (initResponse.error) {
        console.log(initResponse.error);
        Alert.alert("Something went wrong");
        setIsCheckoutLoading(false);
        return;
      }

      if (response.error) {
        Alert.alert('Something went wrong');
        setIsCheckoutLoading(false);
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
        setIsCheckoutLoading(false);
      } else {
        await updateUser();
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error processing your payment. Please try again.');
      setIsCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await Axios.post(`${API_URL}/api/payment/cancelBodegaProSub`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Subscription Cancelled',
          text2: 'Your subscription has been successfully cancelled.',
        });

        const updatedUser = { ...user, subscription: 0 };
        const info = {
          data: {
            client: updatedUser,
            token,
          },
        };
        dispatch(setUser(info));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Cancellation Failed',
          text2: 'There was an issue cancelling your subscription. Please try again.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'There was an error processing your request. Please try again.',
      });
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsCheckoutLoading(false);
      setConfirmCancelModalVisible(false);
    }
  };

  const updateUser = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await Axios.put(`${API_URL}/api/users/addSubscription`, {}, { headers });

      if (response.status === 200) {
        setModalVisible(true);
        const info = {
          data: {
            client: response.data,
            token
          }
        };
        dispatch(setUser(info));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#FFD700' : '#333'} />
        </TouchableOpacity>
        <Animated.View style={{ ...styles.content, opacity: fadeAnim }}>
          {isSubscribed ? (
            <>
              <View style={styles.headerCard}>
                <View style={styles.cardContent}>
                  <Ionicons name="star" size={50} color="#FF8C00" style={styles.iconStyle} />
                  <Text style={styles.headerTitle}>Welcome to Bodega+ Pro!</Text>
                  <Text style={styles.headerText}>You've saved</Text>
                  <LinearGradient
                    colors={['#FFA500', '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.savingsTag}
                  >
                    <Text style={styles.savingsAmount}>${user.savings}</Text>
                  </LinearGradient>
                  <Text style={styles.headerText}>with Bodega+ Pro</Text>
                </View>
              </View>
              <View style={styles.benefitsContainer}>
                <Text style={styles.benefitsTitle}>Exclusive Benefits</Text>
                {benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <FontAwesome name="check-circle" size={24} color="#4CAF50" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity onPress={() => setConfirmCancelModalVisible(true)} disabled={isCheckoutLoading}>
                <Text style={styles.cancelLink}>Cancel subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.joinCard}>
                <Text style={styles.joinTitle}>Join Bodega+ Pro</Text>
                <Text style={styles.joinPrice}>only $9.99</Text>
                <Text style={styles.joinSubtitle}>Unlock these benefits</Text>
              </View>
              <View style={styles.benefitsContainer}>
                {benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <FontAwesome name="lock" size={24} color="#FF5252" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.subscribeButton} onPress={payment} disabled={isCheckoutLoading}>
                {isCheckoutLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.subscribeButtonText}>Start Subscription</Text>
                )}
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
            <Text style={styles.moreInfo}>More info</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Purchase Successful!</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!isModalVisible)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => {
          setInfoModalVisible(!infoModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Subscription Info</Text>
            <Text style={styles.infoText}>
              {isSubscribed ? (
                'You are currently subscribed to Bodega+ Pro. Enjoy benefits such as free shipping, 50% off on tax, and exclusive promotions. You can cancel anytime from the button below or by sending an email to bodegastore@gmail.com.'
              ) : (
                'By subscribing to Bodega+ Pro for only $9.99 per month, you will get exclusive benefits such as free shipping, 50% off on tax, and access to exclusive promotions. You can cancel anytime from the button below or by sending an email to bodegastore@gmail.com.'
              )}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setInfoModalVisible(!infoModalVisible)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmCancelModalVisible}
        onRequestClose={() => {
          setConfirmCancelModalVisible(!confirmCancelModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Confirm Cancellation</Text>
            <Text style={styles.infoText}>Are you sure you want to cancel your Bodega+ Pro subscription? You will lose all the benefits.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmCancelModalVisible(!confirmCancelModalVisible)}
              >
                <Text style={styles.buttonText}>No, Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.buttonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,

  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  moreInfo: {
    marginTop:30
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  headerCard: {
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: '#444',
  },
  cardContent: {
    alignItems: 'center',
  },
  iconStyle: {
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#000',
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  savingsTag: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  savingsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#333',
  },
  benefitText: {
    fontSize: 18,
    marginLeft: 15,
    flexShrink: 1,
    color: '#000',
  },
  cancelLink: {
    fontSize: 18,
    marginTop: 30,
    textDecorationLine: 'underline',
    textAlign: 'center',
    color: '#000',
  },
  joinCard: {
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#444',
  },
  joinTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#000',
  },
  joinPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
  },
  joinSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 5,
    color: '#000',
  },
  moreInfo: {
    fontSize: 16,
    color: '#1E90FF',
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 100,
  },
  subscribeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#FFD700',
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#D3D3D3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#FF5252',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#FFFFFF',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#FFFFFF',
  },
  headerCard: {
    ...commonStyles.headerCard,
    backgroundColor: '#F5F5F5',
  },
  joinCard: {
    ...commonStyles.joinCard,
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  benefitsTitle: {
    ...commonStyles.benefitsTitle,
    color: '#333',
  },
  benefitItem: {
    ...commonStyles.benefitItem,
    backgroundColor: '#FFFFFF',
  },
  benefitText: {
    ...commonStyles.benefitText,
    color: '#333',
  },
  cancelLink: {
    ...commonStyles.cancelLink,
    color: '#333',
  },
  subscribeButtonText: {
    ...commonStyles.subscribeButtonText,
    color: '#333',
  },
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#121212',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#121212',
  },
  benefitsTitle: {
    ...commonStyles.benefitsTitle,
    color: '#fff',
  },
  headerCard: {
    ...commonStyles.headerCard,
    backgroundColor: '#1F1F1F',
  },
  joinCard: {
    ...commonStyles.joinCard,
    backgroundColor: '#1F1F1F',
    borderColor: '#333333',
  },
  benefitItem: {
    ...commonStyles.benefitItem,
    backgroundColor: '#1F1F1F',
  },
  benefitText: {
    ...commonStyles.benefitText,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  cancelLink: {
    ...commonStyles.cancelLink,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  joinTitle: {
    ...commonStyles.joinTitle,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  joinPrice: {
    ...commonStyles.joinPrice,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  joinSubtitle: {
    ...commonStyles.joinSubtitle,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  headerText: {
    ...commonStyles.headerText,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  savingsAmount: {
    ...commonStyles.savingsAmount,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  subscribeButtonText: {
    ...commonStyles.subscribeButtonText,
    color: '#333', // Este se mantiene ya que el botón es oscuro
  },
  moreInfo: {
    ...commonStyles.moreInfo,
    color: '#1E90FF',  // Se mantiene azul para contraste
  },
  modalText: {
    ...commonStyles.modalText,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  infoText: {
    ...commonStyles.infoText,
    color: '#FFFFFF',  // Cambiado a blanco
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: '#FFFFFF',  // Se mantiene blanco
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#FFFFFF',  // Se mantiene blanco
  },
});

export default BodegaPro;