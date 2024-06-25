import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios/lib/axios';
import { setUser } from '../redux/slices/user.slice';
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
  const address = useSelector((state) => state?.user?.address);
  const addresses = useSelector((state) => state?.user?.addresses);
  const colorScheme = useColorScheme();

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

  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <View style={[styles.container]}>
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesome name="arrow-left" size={24} color={colorScheme === 'dark' ? '#FFD700' : '#333'}  />
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
              <FontAwesome name="user" size={20} color={colorScheme === 'dark' ? "#fff" : "#333"} />
              <TextInput
                ref={(ref) => inputRefs.current.name = ref}
                style={[styles.input]}
                placeholder="Name"
                placeholderTextColor={colorScheme === 'dark' ? "#999" : "#666"}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="envelope" size={20} color={colorScheme === 'dark' ? "#fff" : "#333"} />
              <TextInput
                ref={(ref) => inputRefs.current.email = ref}
                style={[styles.input]}
                placeholder="Email"
                placeholderTextColor={colorScheme === 'dark' ? "#999" : "#666"}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="phone" size={20} color={colorScheme === 'dark' ? "#fff" : "#333"} />
              <TextInput
                ref={(ref) => inputRefs.current.phone = ref}
                style={[styles.input]}
                placeholder="Phone"
                placeholderTextColor={colorScheme === 'dark' ? "#999" : "#666"}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="home" size={20} color={colorScheme === 'dark' ? "#fff" : "#333"} />
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addressContainer}>
                <Text style={[styles.addressText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
                  {formData.address}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer]}>
              <FontAwesome name="lock" size={20} color={colorScheme === 'dark' ? "#fff" : "#333"} />
              <TextInput
                ref={(ref) => inputRefs.current.password = ref}
                style={[styles.input]}
                placeholder="Password"
                placeholderTextColor={colorScheme === 'dark' ? "#999" : "#666"}
                secureTextEntry={true}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
              />
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
          theme={colorScheme} // Pass the theme prop to AddressModal
        />
      </View>
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,
    marginTop: 30,
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
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#1c1c1c',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#1c1c1c',
  },
  header: {
    ...commonStyles.header,
    backgroundColor: '#333',
    borderBottomColor: '#555',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  inputContainer: {
    ...commonStyles.inputContainer,
    backgroundColor: '#333',
    borderColor: '#555',
  },
  input: {
    ...commonStyles.input,
    color: '#fff',
  },
  addressText: {
    ...commonStyles.addressText,
    color: '#fff',
  },
  saveButtonText: {
    ...commonStyles.saveButtonText,
    color: '#333',
  },
});

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