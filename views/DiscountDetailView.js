import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Animated,
  SafeAreaView, useColorScheme, ScrollView, Modal, BackHandler
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice';

const DiscountDetailView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const [product, setProduct] = useState(null);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const headerHeight = useRef(new Animated.Value(250)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const shop = route.params.shop || {};
  const discount = route.params.discount || {};

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      const newHeight = Math.max(0, 250 - value);
      Animated.timing(headerHeight, {
        toValue: newHeight,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    });
    return () => {
      scrollY.removeListener(listenerId);
    };
  }, []);

  useEffect(() => {
    const id = { id: discount.product_id };
    const fetchProduct = async () => {
      try {
        const response = await Axios.post(`${API_URL}/api/products/getByProductId`, id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProduct(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProduct();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (cart.length > 0) {
          setConfirmationModalVisible(true);
          return true;
        }
        navigation.goBack();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [cart])
  );

  const handleAddToCart = () => {
    dispatch(addToCart(discount));
  };

  const handleSaveDiscount = () => {
    console.log('Descuento guardado');
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (discount?.discountType === 'percentage') {
      return price - (price * discount.percentage / 100);
    } else {
      return price - discount.fixedValue;
    }
  };

  const discountedPrice = product ? calculateDiscountedPrice(product.price, discount) : null;

  const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.Image source={{ uri: shop?.img }} style={[styles.headerImage, { opacity: headerHeight.interpolate({
          inputRange: [0, 250],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }) }]} />
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => cart.length > 0 ? setConfirmationModalVisible(true) : navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[styles.headerTextContainer, { opacity: headerHeight.interpolate({
          inputRange: [0, 250],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }) }]}>
          <Text style={styles.headerTitle}>{shop?.name}</Text>
          <Text style={styles.headerSubtitle}>{shop?.address}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={14} color="#ff9900" />
            <Text style={styles.shopRating}>{shop?.rating.toFixed(2)}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.contentContainer} ref={scrollViewRef}>
        <View style={styles.productContainer}>
          <Text style={styles.discountTitle}>{discount?.productName}</Text>
          <Image source={{ uri: discount?.image }} style={styles.discountImage} />
          
          {product && (
            <>
              <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
              <Text style={styles.discountedPrice}>${discountedPrice.toFixed(2)}</Text>
            </>
          )}
          <Text style={styles.discountDetails}>
            {discount?.discountType === 'percentage'
              ? `${discount?.percentage}% off`
              : `$${discount?.fixedValue} off`}
          </Text>
          <Text style={styles.discountConditions}>{discount?.conditions}</Text>
          <Text style={styles.discountValidity}>Valid until: {discount?.limitDate}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSaveDiscount}>
          <Text style={styles.buttonText}>Save Discount</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const commonStyles = {
  safeArea: {
    flex: 1,
    marginTop: 30,
  },
  contentContainer: {
    paddingBottom: 80,
  },
  productContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 4,
    fontFamily: 'sans-serif',
    width: "80%",
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shopRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#ff9900',
    fontFamily: 'sans-serif',
  },
  discountTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  discountImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  discountDescription: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  originalPrice: {
    fontSize: 18,
    color: '#888',
    textDecorationLine: 'line-through',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'sans-serif-medium',
  },
  discountedPrice: {
    fontSize: 24,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'sans-serif-bold',
  },
  discountDetails: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'sans-serif-medium',
  },
  discountConditions: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  discountValidity: {
    fontSize: 16,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#FFC107',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'sans-serif-medium',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'sans-serif-medium',
    color: '#333',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'sans-serif-medium',
    color: '#333',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#1c1c1c',
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#fff',
  },
  discountTitle: {
    ...commonStyles.discountTitle,
    color: '#fff',
  },
  discountDescription: {
    ...commonStyles.discountDescription,
    color: '#ccc',
  },
  discountDetails: {
    ...commonStyles.discountDetails,
    color: '#fff',
  },
  discountConditions: {
    ...commonStyles.discountConditions,
    color: '#aaa',
  },
  discountValidity: {
    ...commonStyles.discountValidity,
    color: '#aaa',
  },
  button: {
    ...commonStyles.button,
    backgroundColor: '#FFC107',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#333',
  },
  modalContent: {
    backgroundColor: '#333',
    shadowColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    color: '#fff',
  },
  modalButtonText: {
    color: '#fff',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#333',
  },
  discountTitle: {
    ...commonStyles.discountTitle,
    color: '#333',
  },
  discountDescription: {
    ...commonStyles.discountDescription,
    color: '#666',
  },
  discountDetails: {
    ...commonStyles.discountDetails,
    color: '#333',
  },
  discountConditions: {
    ...commonStyles.discountConditions,
    color: '#999',
  },
  discountValidity: {
    ...commonStyles.discountValidity,
    color: '#999',
  },
  button: {
    ...commonStyles.button,
    backgroundColor: '#FFC107',
  },
  buttonText: {
    ...commonStyles.buttonText,
    color: '#333',
  },
  modalContent: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    color: '#333',
  },
  modalButtonText: {
    color: '#333',
  },
});

export default DiscountDetailView;