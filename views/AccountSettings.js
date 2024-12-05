import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios/lib/axios';
import { setUser, clearUser } from '../redux/slices/user.slice';
import { API_URL } from '@env';
import Toast from 'react-native-toast-message';

const AccountSettings = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo?.data?.token);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoadingData(false);
    }, 1000);

    setHasChanges(
      formData.name !== user.name ||
      formData.email !== user.email ||
      formData.phone !== user.phone
    );
  }, [formData, user]);

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
        navigation.navigate('Login');
        dispatch(clearUser());
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Settings</Text>
        </View>
        {isLoadingData ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#333" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="envelope" size={20} color="#333" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>
            <View style={styles.inputContainer}>
              <FontAwesome name="phone" size={20} color="#333" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#666"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            </View>
            
            <TouchableOpacity
              onPress={hasChanges ? handleSave : null}
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
              disabled={!hasChanges}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(true)} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteModalVisible(true)} style={styles.footerLink}>
                <Text style={styles.footerLinkText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
                  {/* Privacy policy text here */}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    marginLeft: 20,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#D3D3D3',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerLinks: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerLink: {
    marginBottom: 20,
  },
  footerLinkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
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
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AccountSettings;

