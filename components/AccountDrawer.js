import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearUser } from '../redux/slices/user.slice'; // Ajusta la ruta según la ubicación de tu archivo userSlice
import { clearOrders } from '../redux/slices/orders.slice';
import { clearCart } from '../redux/slices/cart.slice';

const AccountDrawer = ({ user, visible, onClose, onNavigate, scheme }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;

  const handleLogout = () => {
    dispatch(clearUser());
    dispatch(clearOrders())
    dispatch(clearCart())
    navigation.navigate('Login');
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!user) {
    return null; // No renderizar nada si el usuario es null
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}  // Asegura que la barra de estado sea translúcida
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.drawer, scheme === 'dark' ? styles.darkDrawer : styles.lightDrawer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.userDetails}>
                <Image source={{ uri: user?.avatar }} style={styles.avatar} />
                <View>
                  <Text style={[styles.drawerTitle, scheme === 'dark' ? styles.darkTitle : styles.lightTitle]}>
                    {user?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <FontAwesome name="close" size={24} color={scheme === 'dark' ? '#FFD700' : '#000'} />
              </TouchableOpacity>
            </View>

            {user?.role === 'guest' ? (
              <View style={styles.guestContainer}>
                <Text style={[styles.drawerTitle, scheme === 'dark' ? styles.darkTitle : styles.lightTitle]}>
                  You are logged in as guest
                </Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <FontAwesome name="arrow-left" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                  <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                    Go back to login
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.drawerSection}>
                  <TouchableOpacity onPress={() => onNavigate('AccountSettings')} style={styles.drawerButton}>
                    <FontAwesome name="cog" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                    <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                      Account Settings
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onNavigate('MyCoupons')} style={styles.drawerButton}>
                    <FontAwesome name="ticket" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                    <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                      My Coupons
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onNavigate('Contact')} style={styles.drawerButton}>
                    <FontAwesome name="phone" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                    <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                      Contact
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onNavigate('BodegaPro')} style={styles.drawerButton}>
                    <FontAwesome name="star" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                    <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                      Bodega+ Pro
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.bodegaBalance}>
                    <FontAwesome name="money" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                    <Text style={[styles.drawerText, scheme === 'dark' ? styles.darkText : styles.lightText, styles.balanceText]}>
                      Bodega Balance: ${parseFloat(user?.balance).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <FontAwesome name="sign-out" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
                  <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 60 : 0,
    bottom: 0,
    width: '80%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,  // Ajusta este valor según sea necesario
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  bodegaBalance: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 20,
  },
  lightDrawer: {
    backgroundColor: '#f7f7f7',
  },
  darkDrawer: {
    backgroundColor: '#333333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerSubtitle: {
    fontSize: 12,
  },
  darkTitle: {
    color: '#fff',
  },
  lightTitle: {
    color: '#000',
  },
  darkSubtitle: {
    color: '#ccc',
  },
  lightSubtitle: {
    color: '#666',
  },
  drawerSection: {
    flex: 1,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  darkButtonText: {
    color: '#fff',
  },
  lightButtonText: {
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountDrawer;
