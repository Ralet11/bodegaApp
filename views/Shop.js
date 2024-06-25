import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Animated,
  SafeAreaView, useColorScheme, ScrollView, ActivityIndicator, Easing, Modal, BackHandler
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import ModalProduct from '../components/modals/ProductModal';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, incrementQuantity, decrementQuantity, clearCart } from '../redux/slices/cart.slice';
import { setCurrentShop } from '../redux/slices/currentShop.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';

const ShopScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState([]);
  const headerHeight = useRef(new Animated.Value(250)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

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
        const response = await Axios.get(`${API_URL}/api/discounts/getByLocalId/${shop?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data)
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

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product, quantity) => {
    dispatch(addToCart({ ...product, quantity }));
    closeModal();
  };

  const totalAmount = cart.reduce((sum, item) => {
    const cleanPrice = item.price.replace(/[^\d.-]/g, '');
    return sum + parseFloat(cleanPrice) * item.quantity;
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
        easing: Easing.inOut(Easing.ease),
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

  const handleConfirmExit = () => {
    dispatch(clearCart());
    setConfirmationModalVisible(false);
    navigation.goBack();
  };

  const navigateToDiscount = (discount) => {
    console.log(discount, "dis in shop")
    navigation.navigate('DiscountDetail', { shop, discount });
  };



  const renderDiscount = (discount) => (
    <TouchableOpacity key={discount.id} style={styles.discountCard} onPress={() => navigateToDiscount(discount)}>
      <Image source={{ uri: discount.image }} style={styles.discountImage} />
      <View style={styles.discountDetails}>
        <Text style={styles.discountTitle}>{discount.productName}</Text>
        <Text style={styles.discountDescription}>{discount.description}</Text>
        <Text style={styles.discountValidity}>Valid until {discount.limitDate}</Text>
        <Text style={styles.discountType}>{discount.delivery ? "Delivery" : "Pick-up"}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProduct = (product) => {
    const productInCart = cart.find(cartItem => cartItem.id === product.id);

    const handleIncrementQuantity = () => {
      if (productInCart) {
        dispatch(incrementQuantity(product.id));
      } else {
        dispatch(addToCart({ ...product, quantity: 1 }));
      }
    };

    const handleDecrementQuantity = () => {
      if (productInCart && productInCart.quantity > 1) {
        dispatch(decrementQuantity(product.id));
      } else if (productInCart && productInCart.quantity === 1) {
        dispatch(decrementQuantity(product.id));
      }
    };

    return (
      <View key={product.id} style={styles.productCard}>
        <TouchableOpacity onPress={() => openModal(product)}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </TouchableOpacity>
        <View style={styles.productDetails}>
          <TouchableOpacity onPress={() => openModal(product)}>
            <Text style={styles.productName}>{product.name}</Text>
          </TouchableOpacity>
          <Text style={styles.productPrice}>{product.price}</Text>
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
    );
  };

  const renderCategory = (category) => (
    <View key={category.id} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      {category.products.map(product => renderProduct(product))}
    </View>
  );

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
      <View style={styles.categoryListContainer}>
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
      </View>
      {loading ? (
        <CartSkeletonLoader /> // Utiliza el componente de skeleton loader aquí
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
          {discounts.length !== 0 && <Text style={styles.discountSectionTitle}>Discounts</Text>}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discountScrollContainer}
          >
            {discounts.map(discount => renderDiscount(discount))}
          </ScrollView>
          {categories.map(category => renderCategory(category))}
        </Animated.ScrollView>
      )}
      <ModalProduct
        visible={modalVisible}
        onClose={closeModal}
        product={selectedProduct}
        addToCart={handleAddToCart}
      />
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>{totalItems} Product{totalItems > 1 ? 's' : ''}</Text>
          <Text style={styles.cartText}>$ {totalAmount}</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('CartScreen')}
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
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Aumenta la opacidad para mejorar la legibilidad
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
    fontSize: 22, // Tamaño de fuente reducido
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 14, // Tamaño de fuente reducido
    color: '#fff',
    marginTop: 4,
    fontFamily: 'sans-serif',
    width: "80%"
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shopRating: {
    marginLeft: 4,
    fontSize: 12, // Tamaño de fuente reducido
    color: '#ff9900',
    fontFamily: 'sans-serif',
  },
  sectionTitle: {
    fontSize: 18, // Tamaño de fuente reducido
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    fontFamily: 'sans-serif-medium',
  },
  offersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoryContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16, // Tamaño de fuente reducido
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  productCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  productImage: {
    width: 80,
    height: 140,
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14, // Tamaño de fuente reducido
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  productPrice: {
    fontSize: 12, // Tamaño de fuente reducido
    marginTop: 4,
    fontFamily: 'sans-serif',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  quantityText: {
    fontSize: 14, // Tamaño de fuente reducido
    marginHorizontal: 8,
    fontFamily: 'sans-serif',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
  },
  cartText: {
    fontSize: 14, // Tamaño de fuente reducido
    fontFamily: 'sans-serif',
  },
  cartButton: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cartButtonText: {
    fontSize: 14, // Tamaño de fuente reducido
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FFC107',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryScrollContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#FFC107',
    borderRadius: 10,
    marginRight: 10,
  },
  categoryButtonText: {
    fontSize: 12, // Tamaño de fuente reducido
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'sans-serif-medium',
  },
  categoryListContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  discountScrollContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
    marginVertical: 10,
  },
  discountCard: {
    width: 220,
    height: 150,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  discountImage: {
    width: '100%',
    height: 60,
  },
  discountDetails: {
    padding: 10,
  },
  discountTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'sans-serif-medium',
  },
  discountDescription: {
    fontSize: 10,
    marginBottom: 2,
    color: '#666',
  },
  discountValidity: {
    fontSize: 9,
    color: '#999',
  },
  discountType: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo más oscuro para mejor contraste
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20, // Aumento de padding para mejor espaciado
    borderRadius: 15, // Esquinas más redondeadas para un aspecto moderno
    width: '85%', // Aumento de ancho para mejor visualización del contenido
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10, // Aumento de elevación para un efecto de sombra más fuerte
  },
  modalText: {
    fontSize: 16, // Tamaño de fuente reducido
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
    padding: 10, // Aumento de padding para mejor sensación del botón
    borderRadius: 8, // Esquinas más redondeadas para un aspecto moderno
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 14, // Tamaño de fuente reducido
    fontFamily: 'sans-serif-medium',
    color: '#333'
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
  offerCard: {
    ...commonStyles.offerCard,
    backgroundColor: '#444',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#fff',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#333',
  },
  productName: {
    ...commonStyles.productName,
    color: '#fff',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#fff',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#fff',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#333',
    borderTopColor: '#444',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#fff',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#333',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
  },
  categoryListContainer: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 10,
  },
  modalContent: {
    backgroundColor: '#444', // Fondo más oscuro para modo oscuro
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
  offerCard: {
    ...commonStyles.offerCard,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#333',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#f8f8f8',
  },
  productName: {
    ...commonStyles.productName,
    color: '#000',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#000',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#000',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#f8f8f8',
    borderTopColor: '#ccc',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#333',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#333',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
  },
  categoryListContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
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

export default ShopScreen;
