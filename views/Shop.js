import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, useColorScheme, FlatList, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import ModalProduct from '../components/modals/ProductModal';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice';
import { setCurrentShop } from '../redux/slices/currentShop.slice';

const ShopScreen = () => {
  const scheme = useColorScheme();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);

  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  const { shop } = route.params;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/local/${shop.id}/categories`);
        setCategories(response.data.categories);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCategories();
  }, [shop.id]);

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

  useEffect(() => {
    dispatch(setCurrentShop(shop.id));
  }, [dispatch, shop.id]);

  const totalAmount = cart.reduce((sum, item) => {
    const cleanPrice = item.price.replace(/[^\d.-]/g, '');
    return sum + parseFloat(cleanPrice) * item.quantity;
  }, 0).toFixed(2);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const styles = scheme === 'dark' ? stylesDark : stylesLight;

  const renderCategory = ({ item: category }) => (
    <View key={category.id} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      <FlatList
        data={category.products}
        keyExtractor={(product) => product.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: product }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => openModal(product)}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [250, 70],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: scheme === 'dark' ? '#1c1c1c' : '#fff' }}>
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Image source={{ uri: shop.img }} style={styles.headerImage} />
        <View style={styles.overlay} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{shop.name}</Text>
          <Text style={styles.headerSubtitle}>{shop.address}</Text>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={14} color="#FFD700" />
            <Text style={styles.shopRating}>4.9</Text>
          </View>
        </View>
      </Animated.View>
      <Animated.FlatList
        data={categories}
        keyExtractor={(category) => category.id.toString()}
        renderItem={renderCategory}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Promociones</Text>}
      />
      <ModalProduct
        visible={modalVisible}
        onClose={closeModal}
        product={selectedProduct}
        addToCart={handleAddToCart}
      />
      {cart.length > 0 && (
        <>
          <View style={styles.cartContainer}>
            <Text style={styles.cartText}>{totalItems} producto{totalItems > 1 ? 's' : ''}</Text>
            <Text style={styles.cartText}>$ {totalAmount}</Text>
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.navigate('CartScreen')}
            >
              <Text style={styles.cartButtonText}>Ver pedido</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CartScreen')}>
            <FontAwesome name="shopping-cart" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const commonStyles = {
  container: {
    flex: 1,
    padding: 16,
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
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 4,
    fontFamily: 'sans-serif',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shopRating: {
    marginLeft: 4,
    fontSize: 16,
    color: '#FFD700',
    fontFamily: 'sans-serif',
  },
  sectionTitle: {
    fontSize: 22,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  productCard: {
    flexDirection: 'column',
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 150,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  productDetails: {
    marginTop: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  productPrice: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'sans-serif',
  },
  addButton: {
    backgroundColor: '#FFC107',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
  },
  cartText: {
    fontSize: 16,
    fontFamily: 'sans-serif',
  },
  cartButton: {
    backgroundColor: '#FFC107',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cartButtonText: {
    fontSize: 16,
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
    color: '#333',
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
});

export default ShopScreen;