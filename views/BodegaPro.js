import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, SafeAreaView, useColorScheme, Animated, Modal, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import Axios from 'react-native-axios/lib/axios';
import { API_URL } from '@env';
import { setUser } from '../redux/slices/user.slice';

const { width } = Dimensions.get('window');

const BodegaPro = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const colorScheme = useColorScheme();
  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(true);
  const isSubscribed = user?.subscription === 1;
  const benefits = [
    'Free shipping',
    'Tax discounts',
    'Exclusive promotions',
    // Add more benefits here
  ];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleCancelSubscription = () => {
    alert('Logic to cancel the subscription');
  };

  const payment = async () => {
    const finalPrice = (10.99 * 100);

    try {
      const response = await Axios.post(`${API_URL}/api/payment/intent`, {
        finalPrice: finalPrice
      });
      const { clientSecret } = response.data;

      if (response.error) {
        Alert.alert('Something went wrong');
        return;
      }

      const initResponse = await initPaymentSheet({
        merchantDisplayName: "Example Name",
        paymentIntentClientSecret: clientSecret,
      });

      if (initResponse.error) {
        Alert.alert("Something went wrong");
        return;
      }

      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        await updateUser();
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error processing your payment. Please try again.');
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
                  <Ionicons name="star" size={50} color="#FFD700" style={styles.iconStyle} />
                  <Text style={styles.headerTitle}>Welcome to Bodega+ Pro!</Text>
                  <Text style={styles.headerText}>You've saved</Text>
                  <Text style={styles.savingsAmount}>$150</Text>
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
              <TouchableOpacity onPress={handleCancelSubscription}>
                <Text style={styles.cancelLink}>Cancel subscription</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.joinCard}>
                <Text style={styles.joinTitle}>Join Bodega+ Pro</Text>
                <Text style={styles.joinPrice}>only $10.99</Text>
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
              <TouchableOpacity style={styles.subscribeButton} onPress={payment}>
                <Text style={styles.subscribeButtonText}>Start Subscription</Text>
              </TouchableOpacity>
            </>
          )}
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
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
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
    color: '',
  },
  headerText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    color: '#FFD700',
  },
  savingsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FFD700',
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
    color: '#FFD700',
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
    color: '#FFD700',
  },
  cancelLink: {
    fontSize: 18,
    marginTop: 30,
    textDecorationLine: 'underline',
    textAlign: 'center',
    color: '#FFD700',
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
    color: '#FFD700',
  },
  joinPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#FFD700',
  },
  joinSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 5,
    color: '#FFD700',
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
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
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
    color: '#FFD700',
  },
  cancelLink: {
    ...commonStyles.cancelLink,
    color: '#FFD700',
  },
  subscribeButtonText: {
    ...commonStyles.subscribeButtonText,
    color: '#333',
  },
});

export default BodegaPro;
