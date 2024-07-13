import React, { useState, useEffect, useRef } from 'react';
import {
  Animated, SafeAreaView, ScrollView, BackHandler, useColorScheme,
  View, Text, TouchableOpacity, Modal, Image, StyleSheet, ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice';
import Toast from 'react-native-toast-message';

const DiscountDetailView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [headerHeight] = useState(new Animated.Value(250));
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

  const combineProductAndDiscount = (product, discount) => {
    const discountedPrice = discount.discountType === 'percentage'
      ? product.price - (product.price * discount.percentage / 100)
      : product.price - discount.fixedValue;
  
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.img,
      price: `$${discountedPrice.toFixed(2)}`, // Format the price as a string with a dollar sign
      quantity: 1, // Default quantity to 1
      discount: true,
      discountId: discount.id,
      discountType: discount.delivery
    };
  };
  const handleAddToCart = async () => {
    if (product) {
      const combinedProduct = combineProductAndDiscount(product, discount);
      console.log(combinedProduct, "product combined")
      dispatch(addToCart(combinedProduct));
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${combinedProduct.name} has been added to your cart.`
      });
    }
  };

  const handleSaveDiscount = async () => {
    setLoading(true);
    try {
      await Axios.post(`${API_URL}/api/discounts/addToUser`, { discountId: discount.id }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Toast.show({
        type: 'success',
        text1: 'Discount Saved',
        text2: 'The discount has been saved successfully.'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Failed to save the discount.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryTag = (delivery) => {
    switch (delivery) {
      case 0:
        return 'Pick-up - Delivery';
      case 1:
        return 'Order-in';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff' }}>
      <Animated.View style={{ height: headerHeight }}>
        <Animated.Image
          source={{ uri: shop?.img }}
          style={{
            width: '100%',
            height: '100%',
            opacity: headerHeight.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
          }}
        />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            opacity: headerHeight.interpolate({
              inputRange: [0, 250],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>{shop?.name}</Text>
          <Text style={{ fontSize: 16, color: '#ffffff', marginTop: 4, width: '80%' }}>{shop?.address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <FontAwesome name="star" size={14} color="#FFC107" />
            <Text style={{ marginLeft: 4, fontSize: 14, color: '#FFC107' }}>{shop?.rating.toFixed(2)}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} ref={scrollViewRef}>
        <View style={styles.productCard}>
          <Image source={{ uri: discount?.image }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{discount?.productName}</Text>
            {product && (
              <>
                <Text style={styles.originalPrice}>${product.price}</Text>
                <Text style={styles.discountedPrice}>${(discount.discountType === 'percentage'
                  ? product.price - (product.price * discount.percentage / 100)
                  : product.price - discount.fixedValue).toFixed(2)}</Text>
              </>
            )}
            <Text style={styles.discountDetails}>
              {discount?.discountType === 'percentage'
                ? `${discount?.percentage}% off`
                : `$${discount?.fixedValue} off`}
            </Text>
            <Text style={styles.discountConditions}>{discount?.conditions}</Text>
            <Text style={styles.discountValidity}>Valid until: {new Date(discount?.limitDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.deliveryTag}>
            <Text style={styles.deliveryTagText}>{getDeliveryTag(discount.delivery)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSaveDiscount}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Discount</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 15,
    margin: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    position: 'relative',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  discountedPrice: {
    fontSize: 20,
    color: '#006400',
    marginBottom: 10,
  },
  discountDetails: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  discountConditions: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  discountValidity: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  deliveryTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFC107',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  deliveryTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default DiscountDetailView;