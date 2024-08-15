import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Animated,
  SafeAreaView, useColorScheme, ScrollView, ActivityIndicator, Modal, BackHandler
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity, decrementQuantity, clearCart } from '../redux/slices/cart.slice';
import { setCurrentShop } from '../redux/slices/currentShop.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';
import { stylesDark, stylesLight } from '../components/themeShop';
import DiscountCard from '../components/DiscountCard';
import ModalDiscount from '../components/modals/DiscountModal';
import ProductDetail from '../components/ProductDetail'; // Importamos el nuevo componente

const ShopScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const [orderType, setOrderType] = useState('Pick-up');
  const [pendingOrderType, setPendingOrderType] = useState(null);
  const headerHeight = useRef(new Animated.Value(250)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [selectedDiscount, setSelectedDiscount] = useState(false)
  const [discountModalVisible, setDiscountModalVisible] = useState(false)

  const { shop } = route.params || {};

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/local/${shop?.id}/categories`);
        setCategories(response.data.categories || []);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    const fetchDiscounts = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/discounts/getByLocalIdApp/${shop?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDiscounts(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (shop?.id) {
      fetchCategories();
      fetchDiscounts();
    }
  }, [shop?.id]);

  useEffect(() => {
    if (shop?.id) {
      dispatch(setCurrentShop(shop.id));
    }
  }, [dispatch, shop?.id]);

  const openProductDetail = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedOptions({});
  };

  const openDiscountModal = (discount) => {
    setSelectedDiscount(discount);
    setDiscountModalVisible(true);
  };

  const closeDiscountModal = () => {
    setDiscountModalVisible(false);
    setSelectedDiscount(null);
  };

  const handleSelectOption = (extraId, option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [extraId]: option,
    }));
  };

  const handleAddToCart = (product, quantity) => {
    const selectedExtras = Object.values(selectedOptions);
    if (orderType == 'Order-in' && product.delivery == 0) {
      alertCannotAddProduct();
    } else if ((orderType == 'Pick-up' || orderType == 'Delivery') && product.delivery == 1) {
      alertCannotAddProduct();
    } else {
      dispatch(addToCart({ ...product, quantity, extras: selectedExtras }));
      closeProductDetail();
    }
  };

  const totalAmount = cart.reduce((sum, item) => {
    const price = item.price || 0;
    return sum + price * item.quantity;
  }, 0).toFixed(2);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const scrollToCategory = (index) => {
    const yPosition = index * 250;
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
    }
  };

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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (selectedProduct) {
          closeProductDetail();
          return true;
        }
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
    }, [cart, selectedProduct])
  );

  const handleConfirmExit = () => {
    dispatch(clearCart());
    setConfirmationModalVisible(false);
    navigation.goBack();
  };

  const navigateToDiscount = (discount) => {
    navigation.navigate('DiscountDetail', { shop, discount });
  };

  const alertCannotAddProduct = () => {
    alert('You cannot add this product to your cart for the current order type.');
  };

  const handleOrderTypeChange = (type) => {
    const hasIncompatibleItems = type == 'Order-in'
      ? cart.some(item => item.discountType != 1)
      : cart.some(item => item.discountType == 1);

    if (hasIncompatibleItems) {
      setPendingOrderType(type);
      setOrderTypeModalVisible(true);
    } else {
      setOrderType(type);
    }
  };

  const confirmOrderTypeChange = () => {
    setOrderType(pendingOrderType);
    setPendingOrderType(null);
    dispatch(clearCart());
    setOrderTypeModalVisible(false);
  };

  const renderDiscount = (discount, isBlockLayout) => {
    return (
     <View style={{ width: 300, marginHorizontal: 5 }}>
       <DiscountCard
        key={discount.id}
        discount={discount}
        openDiscountModal={openDiscountModal}
        isBlockLayout={isBlockLayout}
      />
     </View>
    );
  };

  const renderProduct = (product) => {
    const productInCart = cart?.find(cartItem => cartItem?.id == product?.id);

    const handleIncrementQuantity = () => {
      if (product.extras.length > 0) {
        openProductDetail(product);
      } else {
        if (productInCart) {
          dispatch(incrementQuantity(product?.id));
        } else {
          dispatch(addToCart({ ...product, quantity: 1 }));
        }
      }
    };

    const handleDecrementQuantity = () => {
      if (productInCart && productInCart.quantity > 1) {
        dispatch(decrementQuantity(product?.id));
      } else if (productInCart && productInCart.quantity == 1) {
        dispatch(decrementQuantity(product?.id));
      }
    };

    return (
      <View key={product.id} style={styles.productCard}>
        <TouchableOpacity onPress={() => openProductDetail(product)}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </TouchableOpacity>
        <View style={styles.productDetails}>
          <TouchableOpacity onPress={() => openProductDetail(product)}>
            <Text style={styles.productName}>{product.name}</Text>
          </TouchableOpacity>
          <Text style={styles.productDescription}>{product.description}</Text>
          <View style={styles.productPriceContainer}>
            <Text style={styles.productPrice}>${product.price}</Text>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.quantityButton} onPress={handleDecrementQuantity}>
                <FontAwesome name="minus" size={14} color="#000" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{productInCart ? productInCart.quantity : 0}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={handleIncrementQuantity}>
                <FontAwesome name="plus" size={14} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCategory = (category) => (
    <View key={category.id} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      {category.products.map(product => renderProduct(product))}
    </View>
  );

  const styles = colorScheme == 'dark' ? stylesDark : stylesLight;

  const orderTypes = [
    { type: 'Pick-up', icon: 'shopping-basket', available: shop.pickUp },
    { type: 'Delivery', icon: 'bicycle', available: shop.delivery },
    { type: 'Order-in', icon: 'cutlery', available: shop.orderIn },
  ].filter(orderType => orderType.available);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.Image source={{ uri: shop?.img }} style={[styles.headerImage, {
          opacity: headerHeight.interpolate({
            inputRange: [0, 250],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        }]} />
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => {
          if (selectedProduct) {
            closeProductDetail();
          } else {
            navigation.goBack();
          }
        }} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View style={[styles.headerTextContainer, {
          opacity: headerHeight.interpolate({
            inputRange: [0, 250],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })
        }]}>
          <Text style={styles.headerTitle}>{shop?.name}</Text>
          <Text style={styles.headerSubtitle}>{shop?.address}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={14} color="#ff9900" />
            <Text style={styles.shopRating}>{shop?.rating.toFixed(2)}</Text>
          </View>
        </Animated.View>
      </Animated.View>
      {!selectedProduct && (
        <View style={styles.orderTypeContainer}>
          {orderTypes.map(order => (
            <TouchableOpacity
              key={order.type}
              style={[
                styles.orderTypeButton,
                orderType == order.type && styles.selectedOrderTypeButton,
              ]}
              onPress={() => handleOrderTypeChange(order.type)}
            >
              <FontAwesome name={order.icon} size={15} color={orderType == order.type ? '#8C6D00' : '#333'} />
              <Text style={styles.orderTypeText}>{order.type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!selectedProduct && (
        <View style={styles.categoryListContainer}>
          {orderType !== 'Order-in' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
            >
              {categories.map((item, index) => (
                <TouchableOpacity key={item.id} onPress={() => scrollToCategory(index)} style={styles.categoryButton}>
                  <Text style={styles.categoryButtonText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      {loading ? (
        <CartSkeletonLoader />
      ) : (
        <Animated.ScrollView
          ref={scrollViewRef}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          contentContainerStyle={styles.contentContainer}
        >
          {orderType == 'Order-in' && !selectedProduct ? (
            discounts.filter(discount => discount.delivery == 1).map(discount => renderDiscount(discount, true))
          ) : (
            !selectedProduct && (
              <View style={{ backgroundColor: 'white', flex: 1, marginBottom: 5 }}>
                {discounts.length > 0 && <Text style={styles.discountSectionTitle}>Our best discounts</Text>}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.discountScrollContainer}
                >
                  {discounts.filter(discount => discount.delivery == 0).map(discount => renderDiscount(discount, false))}
                </ScrollView>
              </View>
            )
          )}
          {orderType !== 'Order-in' && selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onAddToCart={handleAddToCart}
              onBack={closeProductDetail}
            />
          ) : (
            categories.map(category => renderCategory(category))
          )}
        </Animated.ScrollView>
      )}
      <ModalDiscount
        visible={discountModalVisible}
        onClose={closeDiscountModal}
        discount={selectedDiscount}
      />
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>{totalItems} Product{totalItems > 1 ? 's' : ''}</Text>
          <Text style={styles.cartText}>$ {totalAmount}</Text>
          <Text style={styles.cartText}>{orderType}</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('CartScreen', { orderType })}
          >
            <Text style={styles.cartButtonText}>Go to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
      {cart.length > 0 && (
        <Modal
          visible={confirmationModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setConfirmationModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>If you proceed, the cart will be cleared. Are you sure?</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleConfirmExit}
                >
                  <Text style={styles.modalButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                  onPress={() => setConfirmationModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <Modal
        visible={orderTypeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOrderTypeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Changing the order type will clear your cart. Are you sure you want to proceed?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={confirmOrderTypeChange}
              >
                <Text style={styles.modalButtonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setOrderTypeModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ShopScreen;