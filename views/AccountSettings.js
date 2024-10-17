import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios/lib/axios';
import { setUser, clearUser } from '../redux/slices/user.slice';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';
import AddressModal from '../components/modals/AddressModal'; // Asegúrate de ajustar la ruta según la ubicación del archivo

const AccountSettings = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // Estado para controlar el loader
  const address = useSelector((state) => state?.user?.address?.formatted_address);
  const addresses = useSelector((state) => state?.user?.addresses);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const inputRefs = useRef({
    name: null,
    email: null,
    phone: null,
    address: null,
    password: null,
  });

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: address,
    password: ''
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Simular la carga de datos
    setTimeout(() => {
      setIsLoadingData(false); // Datos cargados
    }, 2000);

    setHasChanges(
      formData.name !== user.name ||
      formData.email !== user.email ||
      formData.phone !== user.phone ||
      formData.address !== address ||
      formData.password !== ''
    );
  }, [formData, user, address]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await Axios.delete(`${API_URL}/api/users/deleteUser`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        navigation.navigate('Login')
        dispatch(clearOrders())
        dispatch(clearCart())
        dispatch(clearUser()); // Clear user data from Redux
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete account'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Dejar de hacer focus en los inputs
    Object.values(inputRefs.current).forEach(ref => {
      if (ref) {
        ref.blur();
      }
    });

    setLoading(true);
    try {
      const response = await Axios.put(
        `${API_URL}/api/users/updateUser`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        const user = {
          data: {
            client: response.data,
            token,
            error: false
          }
        };
        dispatch(setUser(user));
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'User information updated successfully'
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update user information'
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = stylesLight;

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View style={[styles.container]}>
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle]}>Account Settings</Text>
        </View>
        {isLoadingData ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="user" size={20} color="#333" />
              <TextInput
                ref={(ref) => inputRefs.current.name = ref}
                style={[styles.input]}
                placeholder="Name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="envelope" size={20} color="#333" />
              <TextInput
                ref={(ref) => inputRefs.current.email = ref}
                style={[styles.input]}
                placeholder="Email"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="phone" size={20} color="#333" />
              <TextInput
                ref={(ref) => inputRefs.current.phone = ref}
                style={[styles.input]}
                placeholder="Phone"
                placeholderTextColor="#666"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="home" size={20} color="#333" />
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addressContainer}>
                <Text style={[styles.addressText, { color: '#333' }]}>
                  {formData.address}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              onPress={hasChanges ? handleSave : null}
              style={[
                styles.saveButton,
                { backgroundColor: hasChanges ? '#FFD700' : '#ccc' }
              ]}
              disabled={!hasChanges}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                <Text style={styles.footerLinkText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
        <AddressModal
          visible={modalVisible}
          addresses={addresses}
          onSelect={(address) => {
            handleInputChange('address', address);
            setModalVisible(false);
          }}
          onClose={() => setModalVisible(false)}
        />
        <Modal
          visible={privacyModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPrivacyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
                <Text style={styles.modalText}>
                  Effective Date: 07/17/24

                  1. Introduction
                  Bodega ("we," "our," or "the App") is committed to protecting your privacy. This Privacy Policy explains how we access, collect, use, disclose, and protect the information we obtain from users of our application.

                  2. Information We Collect
                  We collect the following types of information:

                  2.1 Personal Information:

                  Name: Used to personalize your experience and for identification purposes.
                  Email Address: Used for account creation, communication, and password recovery.
                  Phone Number: Used for account verification, communication, and support.
                  Address: Used to facilitate the delivery of goods purchased through our app.
                  Payment Information: Collected to process transactions securely.
                  2.2 Usage Information:

                  Interaction Data: Information about how you interact with our app, including pages visited, features used, and time spent on the app. This helps us understand user preferences and improve the app.
                  Purchase History: Data on items purchased to provide personalized recommendations and improve service offerings.
                  2.3 Device Information:

                  Hardware Model and Operating System: Used to ensure compatibility and provide optimal app performance.
                  Unique Device Identifiers: Used for security purposes and to prevent fraud.
                  Mobile Network Information: Helps in optimizing app performance based on network conditions.
                  Location Data: Collected, if permitted by the user, to provide location-based services such as store recommendations and delivery tracking.
                  3. How We Use the Information
                  We use the collected information for the following purposes:

                  3.1 To Provide and Maintain Our App:

                  Ensuring the app functions correctly and efficiently.
                  Processing transactions and orders made through the app.
                  3.2 To Improve and Personalize the User Experience:

                  Customizing content and recommendations based on your preferences and usage patterns.
                  Enhancing app features and user interface.
                  3.3 To Communicate Updates, News, and Promotions:

                  Sending notifications about updates, new features, and promotional offers.
                  Responding to customer inquiries and providing support.
                  3.4 To Monitor and Analyze App Usage and Trends:

                  Conducting analytics to understand how users interact with the app.
                  Improving app performance and resolving technical issues.
                  4. Information Security
                  We take reasonable measures to protect users' personal information against loss, theft, and unauthorized use. This includes:

                  4.1 Password Encryption:

                  User passwords are encrypted using the bcrypt algorithm to ensure their security.
                  4.2 Secure Storage:

                  Sensitive personal information is encrypted and securely stored on our servers.
                  4.3 Restricted Access:

                  Access to personal information is limited to employees, contractors, and agents who need to know that information to process it on our behalf.
                  4.4 Data Retention:

                  We retain personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy. Once no longer needed, data is securely deleted.
                  5. Information Disclosure
                  We do not sell or share your personal information with third parties, except in the following circumstances:

                  5.1 Legal Requirements:

                  To comply with applicable laws, regulations, legal processes, or governmental requests.
                  5.2 Safety and Fraud Prevention:

                  To protect the safety of our users, detect and prevent fraud, or address technical issues.
                  5.3 Trusted Service Providers:

                  With trusted service providers who assist us in operating our app, provided they agree to adhere to our data protection policies.
                  5.4 Business Transfers:

                  In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.
                  6. Children's Privacy
                  Our app is not intended for individuals under the age of 17, and we do not knowingly collect personal information from individuals under 17. If we become aware that we have inadvertently collected personal information from someone under 17, we will take steps to delete such information from our records.

                  7. Data Retention and Deletion Policy
                  We retain your personal information only for as long as necessary to fulfill the purposes for which we collected it, including for the purposes of satisfying any legal, accounting, or reporting requirements. When your personal information is no longer needed, we will securely delete or anonymize it.

                  7.1 Retention Periods:

                  Account Information: Retained as long as your account is active or as needed to provide you with services.
                  Transaction Data: Retained for a reasonable period as required by law for accounting and tax purposes.
                  7.2 Deletion Procedures:

                  Upon request, we will delete your personal information from our systems. This process may take up to 30 days to complete.
                  Some information may be retained in backup copies for a limited period to comply with legal obligations.
                  8. Changes to This Privacy Policy
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this policy.

                  9. Contact
                  If you have any questions about this Privacy Policy, please contact us at:

                  KH Software Corp
                  Email: bodegastore@gmail.com

                  We are committed to addressing your inquiries and resolving any concerns you may have regarding our privacy practices.
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPrivacyModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
        <Modal
          visible={deleteModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
              <Text style={styles.modalText}>
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleDeleteAccount}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Yes, Delete</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,
   
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  addressContainer: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    height: 70, // Tamaño consistente con otros campos
  },
  addressText: {
    fontSize: 16,
    textAlignVertical: 'center',
  },
  saveButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinks: {
    marginTop: 200,
    alignItems: 'center'
  },
  footerLinkText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
    textDecorationLine: 'underline', // Subrayado
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    backgroundColor: '#ff3333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginRight: 10,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    backgroundColor: '#ffcc00',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#f9f9f9',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#333',
  },
  inputContainer: {
    ...commonStyles.inputContainer,
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  input: {
    ...commonStyles.input,
    color: '#333',
  },
  addressText: {
    ...commonStyles.addressText,
    color: '#333',
  },
  saveButtonText: {
    ...commonStyles.saveButtonText,
    color: '#fff',
  },
});

export default AccountSettings;
