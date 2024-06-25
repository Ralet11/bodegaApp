import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux'; 
import { clearUser } from '../redux/slices/user.slice';
import { setUserDiscounts } from '../redux/slices/setUp.slice';


const LogoScreen = () => {
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isAuthenticated = useSelector(state => state.user.isAuthenticated); 
  const dispatch = useDispatch();


  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      if (isAuthenticated) {
        navigation.navigate('Main');
      } else {
        navigation.navigate('Login');
        dispatch(clearUser());
      }
    }, 3000);

    return () => clearTimeout(redirectTimeout);
  }, [isAuthenticated, navigation, dispatch]);

  

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1717527579/WhatsApp_Image_2024-05-25_at_17.24.54_lpri1m.jpg' }}
        style={[styles.logo, { transform: [{ scale: scaleAnim }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2BB26',
  },
  logo: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').height * 0.8,
  },
});

export default LogoScreen;