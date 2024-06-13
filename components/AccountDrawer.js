import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { clearUser } from '../redux/slices/user.slice'; // Ajusta la ruta según la ubicación de tu archivo userSlice

const AccountDrawer = ({ user, visible, onClose, onNavigate, scheme }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch(clearUser());
    navigation.navigate('Login');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.drawer, scheme === 'dark' ? styles.darkDrawer : styles.lightDrawer]}>
          <View style={styles.header}>
            <Text style={[styles.drawerTitle, scheme === 'dark' ? styles.darkTitle : styles.lightTitle]}>
              {user.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="close" size={24} color={scheme === 'dark' ? '#FFD700' : '#000'} />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.drawerText, scheme === 'dark' ? styles.darkText : styles.lightText]}>
              {user.email}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('AccountSettings')} style={styles.drawerButton}>
            <FontAwesome name="cog" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
            <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
              Account Settings
            </Text>
            <FontAwesome name="chevron-right" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('MyCoupons')} style={styles.drawerButton}>
            <FontAwesome name="ticket" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
            <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
              My Coupons
            </Text>
            <FontAwesome name="chevron-right" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('Contact')} style={styles.drawerButton}>
            <FontAwesome name="phone" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
            <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
              Contact
            </Text>
            <FontAwesome name="chevron-right" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate('BodegaPro')} style={styles.drawerButton}>
            <FontAwesome name="star" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
            <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
              Bodega+ Pro
            </Text>
            <FontAwesome name="chevron-right" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.drawerButton}>
            <FontAwesome name="sign-out" size={20} color={scheme === 'dark' ? '#FFD700' : '#333'} />
            <Text style={[styles.drawerButtonText, scheme === 'dark' ? styles.darkButtonText : styles.lightButtonText]}>
              Logout
            </Text>
           
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawer: {
    width: '90%',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 8,
  },
  lightDrawer: {
    backgroundColor: '#fff',
  },
  darkDrawer: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  drawerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  darkTitle: {
    color: '#fff',
  },
  lightTitle: {
    color: '#333',
  },
  drawerText: {
    fontSize: 16,
  },
  darkText: {
    color: '#aaa',
  },
  lightText: {
    color: '#666',
  },
  drawerButtonText: {
    flex: 1,
    fontSize: 18,
    marginLeft: 10,
  },
  darkButtonText: {
    color: '#fff',
  },
  lightButtonText: {
    color: '#333',
  },
});

export default AccountDrawer;