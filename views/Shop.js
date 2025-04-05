import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  BackHandler,
  useColorScheme,
  Animated,
  Linking,
  Alert,
  Easing,
  StyleSheet,
  Dimensions, // Se importa Dimensions para obtener el ancho de la pantalla
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../redux/slices/cart.slice';
import { setCurrentShop } from '../redux/slices/currentShop.slice';
import { setAuxCart } from '../redux/slices/setUp.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';
import ShopContentOrderIn from '../components/ShopContentOrderIn';
import { stylesDark, stylesLight } from '../components/themeShop';
import PromoCard from '../components/PromoMealCard';
import ProductDetail from '../components/ProductDetail';
import Toast from 'react-native-toast-message';

const windowWidth = Dimensions.get('window').width; // Se obtiene el ancho de la pantalla

const ShopScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // ====================
  // Global States (Redux)
  // ====================
  const cart = useSelector(state => state.cart.items);
  const user = useSelector(state => state?.user?.userInfo?.data?.client);
  const token = useSelector(state => state?.user?.userInfo.data.token);

  // ====================
  // Local States
  // ====================
  const [categories, setCategories] = useState([]);            // Todas las categorías
  const [filteredCategories, setFilteredCategories] = useState([]); // En este caso, serán las mismas
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);                // Para mostrar el skeleton mientras carga
  const [orderType, setOrderType] = useState('Pick-up');
  const [promotion, setPromotion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reviews, setReviews] = useState([]);

  const colorScheme = useColorScheme();

  // Navigation parameters
  const params = route.params || {};
  const shop = params.shop || null;
  const orderTypeParam = params.orderTypeParam;
  const orderDetails = params.orderDetails || null;

  // Control para evitar doble retroceso
  const isNavigatingBack = useRef(false);

  // Para el sticky category bar
  const [showStickyCategoryScroll, setShowStickyCategoryScroll] = useState(false);
  const [categoryListY, setCategoryListY] = useState(0);
  const categoryRefs = useRef([]);
  const categoryPositions = useRef([]);
  const [positionsReady, setPositionsReady] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  // Animación para el sticky bar
  const stickyAnimValue = useRef(new Animated.Value(0)).current;

  // Styles: se usa stylesLight (o stylesDark si se desea forzar el modo oscuro)
  const styles = stylesLight;

  // ====================
  // Effects
  // ====================

  // Marcar componente como listo al montar
  useEffect(() => {
    setIsComponentReady(true);
  }, []);

  // Cargar productos de pedidos anteriores (si se pasan en orderDetails)
  useEffect(() => {
    if (orderDetails && Array.isArray(orderDetails) && orderDetails.length > 0) {
      orderDetails.forEach(product => {
        dispatch(
          addToCart({
            ...product,
            quantity: product.quantity || 1,
            selectedExtras: product.selectedExtras || {},
            price: product.currentPrice || product.price,
          })
        );
      });
    }
  }, [orderDetails, dispatch]);

  // Cargar reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (shop?.id) {
          const response = await Axios.get(`${API_URL}/api/reviews/getByLocal/${shop.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReviews(response.data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, [shop?.id, token]);

  // Ajustar orderType según orderTypeParam
  useEffect(() => {
    if (orderTypeParam !== undefined) {
      switch (orderTypeParam) {
        case 0:
          setOrderType('Order-in');
          break;
        case 1:
          setOrderType('Pick-up');
          break;
        default:
          setOrderType('Pick-up');
          break;
      }
    }
  }, [orderTypeParam]);

  // <-- Se eliminó la lógica de filtrado por "availableFor":
  // Ahora se obtienen y se muestran todas las categorías y productos.
  useEffect(() => {
    const fetchCategories = async () => {
      if (!shop?.id) return;
      try {
        setLoading(true);
        const response = await Axios.get(`${API_URL}/api/local/${shop.id}/categories`);
        const allCats = response.data.categories || [];
        setCategories(allCats);
        setFilteredCategories(allCats);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [shop?.id]);

  // Al cambiar las categorías (o el orderType, aunque ya no afecta), se actualiza filteredCategories
  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  // Obtener promoción para el local
  useEffect(() => {
    const getPromotionByShop = async () => {
      if (!shop?.id) return;
      try {
        const response = await Axios.get(`${API_URL}/api/promotions/getByLocal/${shop.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPromotion(response.data || null);
      } catch (error) {
        console.log(error);
      }
    };
    getPromotionByShop();
  }, [shop?.id, token]);

  // Establecer el local actual en Redux
  useEffect(() => {
    if (shop?.id) {
      dispatch(setCurrentShop(shop.id));
    }
  }, [dispatch, shop?.id]);

  // Animar el sticky bar en el scroll
  useEffect(() => {
    Animated.timing(stickyAnimValue, {
      toValue: showStickyCategoryScroll ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showStickyCategoryScroll, stickyAnimValue]);

  // ====================
  // Back Button Handling
  // ====================
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isNavigatingBack.current) return true;
        isNavigatingBack.current = true;

        if (!selectedProduct) {
          if (cart.length > 0) {
            dispatch(clearCart());
            dispatch(setAuxCart());
            navigation.navigate('Main');
            return true;
          } else {
            dispatch(setAuxCart());
            navigation.navigate('Main');
            return true;
          }
        } else {
          setSelectedProduct(null);
          isNavigatingBack.current = false;
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        isNavigatingBack.current = false;
      };
    }, [cart, selectedProduct, navigation, dispatch])
  );

  // Manejo de "before leaving" (iOS swipe/back)
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', e => {
      if (cart.length > 0) {
        e.preventDefault();
        dispatch(clearCart());
        dispatch(setAuxCart());
        Toast.show({
          type: 'info',
          text1: 'Cart Emptied',
          text2: 'Your cart has been successfully emptied.',
          position: 'bottom',
          visibilityTime: 2000,
          autoHide: true,
        });
        navigation.dispatch(e.data.action);
      } else {
        dispatch(setAuxCart());
        navigation.dispatch(e.data.action);
      }
    });

    return () => {
      navigation.removeListener('beforeRemove', beforeRemoveListener);
    };
  }, [navigation, cart, dispatch]);

  // ====================
  // Funciones
  // ====================

  const scrollViewRef = useRef(null);

  const handleScroll = event => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY >= categoryListY) {
      setShowStickyCategoryScroll(true);
    } else {
      setShowStickyCategoryScroll(false);
    }

    categoryPositions.current.forEach((position, index) => {
      if (
        position <= scrollY + categoryListY + 10 &&
        (categoryPositions.current[index + 1] === undefined ||
          categoryPositions.current[index + 1] > scrollY + categoryListY + 10)
      ) {
        setSelectedCategory(index);
      }
    });
  };

  const scrollToCategory = index => {
    if (!positionsReady || !isComponentReady) {
      console.log('Component not ready to scroll yet');
      return;
    }
    if (scrollViewRef.current && categoryPositions.current[index] !== undefined) {
      setSelectedCategory(index);
      const positionY = categoryPositions.current[index];
      scrollViewRef.current.scrollTo({ y: positionY - categoryListY, animated: true });
    } else {
      console.log('Could not scroll (refs not available yet).');
    }
  };

  const handleOrderTypeChange = type => {
    setOrderType(type);
    // Aunque se cambia el orderType, ya no se filtra la lista de productos.
  };

  const handleAddToCart = (product, quantity) => {
    dispatch(
      addToCart({
        ...product,
        quantity,
        price: product.finalPrice ?? product.price,
      })
    );
    closeProductDetail();
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedOptions({});
  };

  const goReviewScreen = () => {
    navigation.navigate('ReviewSceen', { shop, reviews });
  };

  const openAddressInGoogleMaps = address => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log('Cannot open the URL:', url);
        }
      })
      .catch(err => console.error('Error trying to open the URL:', err));
  };

  // Botones de orderType (se mantienen en la UI, aunque ya no filtran productos)
  const renderOrderTypeButtons = () => {
    return (
      <>
        {shop?.orderIn && (
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              orderType === 'Order-in' && styles.selectedOrderTypeButton
            ]}
            onPress={() => handleOrderTypeChange('Order-in')}
          >
            <FontAwesome
              name="cutlery"
              size={15}
              color={orderType === 'Order-in' ? '#8C6D00' : '#333'}
            />
            <Text style={styles.orderTypeText}>Dine-in</Text>
          </TouchableOpacity>
        )}
        {shop?.pickUp && (
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              orderType === 'Pick-up' && styles.selectedOrderTypeButton
            ]}
            onPress={() => handleOrderTypeChange('Pick-up')}
          >
            <FontAwesome
              name="shopping-basket"
              size={15}
              color={orderType === 'Pick-up' ? '#8C6D00' : '#333'}
            />
            <Text style={styles.orderTypeText}>Pick-up</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // Totales del carrito
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart
    .reduce((sum, item) => sum + (item.finalPrice ?? 0) * item.quantity, 0)
    .toFixed(2);

  // ====================
  // Render Principal
  // ====================

  return (
    <SafeAreaView style={styles.safeArea}>
      {selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBack={closeProductDetail}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            nestedScrollEnabled={true}
            style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            {/* Header con imagen */}
            <View style={styles.headerImageContainer}>
              <Image
                source={{ uri: shop?.deliveryImage }}
                style={[styles.headerImage, { width: windowWidth, alignSelf: 'center' }]}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  if (!selectedProduct) {
                    if (cart.length > 0) {
                      dispatch(clearCart());
                      dispatch(setAuxCart());
                      navigation.navigate('Main');
                    } else {
                      dispatch(setAuxCart());
                      navigation.navigate('Main');
                    }
                  } else {
                    setSelectedProduct(null);
                  }
                }}
                style={styles.backButton}
              >
                <FontAwesome name="arrow-left" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Información del local */}
            <View style={styles.shopInfoContainer}>
              <Text style={styles.shopName}>{shop?.name}</Text>
              <TouchableOpacity
                style={styles.shopAddressContainer}
                onPress={() => openAddressInGoogleMaps(shop?.address)}
              >
                <FontAwesome name="map-marker" size={18} color="#000" />
                <Text style={styles.shopAddress}>{shop?.address}</Text>
              </TouchableOpacity>

              {/* Rating y botones de orderType */}
              <View style={styles.ratingAndOrderTypeContainer}>
                <TouchableOpacity
                  onPress={goReviewScreen}
                  style={styles.shopRatingContainer}
                >
                  <FontAwesome name="star" size={14} color="#ffcc00" />
                  <Text style={styles.shopRating}>
                    {shop?.rating?.toFixed(1)}
                  </Text>
                  <Text style={styles.shopRatingOpinions}>
                    ({reviews.length || 0})
                  </Text>
                  <FontAwesome name="chevron-right" style={styles.shopRatingArrow} />
                </TouchableOpacity>
                <View style={styles.orderTypeButtonsContainer}>
                  {renderOrderTypeButtons()}
                </View>
              </View>
            </View>

            {/* Barra de categorías */}
            <View
              style={styles.categoryListContainer}
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                setCategoryListY(layout.y);
              }}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.contentContainer}
              >
                {filteredCategories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      positionsReady && isComponentReady && scrollToCategory(index)
                    }
                    disabled={!positionsReady || !isComponentReady}
                    style={[
                      styles.categoryButton,
                      selectedCategory === index && styles.activeCategoryButton,
                      (!positionsReady || !isComponentReady) && { opacity: 0.5 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText1,
                        selectedCategory === index && styles.activeCategoryButtonText,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.categorySeparator} />
            </View>

            {/* PromoCard (si hay promoción) */}
            {promotion && Object.keys(promotion).length > 0 && (
              <PromoCard user={user} shop={shop} token={token} promotion={promotion} />
            )}

            {/* Si está cargando => Skeleton; si no, renderiza las categorías */}
            {loading ? (
              <CartSkeletonLoader />
            ) : filteredCategories.length > 0 ? (
              <ShopContentOrderIn
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                cart={cart}
                handleAddToCart={handleAddToCart}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                closeProductDetail={closeProductDetail}
                categories={filteredCategories}
                categoryRefs={categoryRefs}
                categoryPositions={categoryPositions}
                setPositionsReady={setPositionsReady}
                promotion={promotion}
                shop={shop}
              />
            ) : (
              <View style={extraStyles.noProductsContainer}>
                <FontAwesome name="frown-o" style={extraStyles.noProductsIcon} />
                <Text style={extraStyles.noProductsTitle}>No Dishes Available</Text>
                <Text style={extraStyles.noProductsText}>
                  We're currently updating our menu. Please check back soon for exciting new dishes!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Sticky Category Scroll */}
          <Animated.View
            style={[
              styles.stickyCategoryList,
              {
                opacity: stickyAnimValue,
                transform: [
                  {
                    translateY: stickyAnimValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.stickyHeader}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(setAuxCart());
                  navigation.navigate('Main');
                }}
                style={styles.stickyBackButton}
              >
                <FontAwesome name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.stickyHeaderText}>{shop?.name ?? ''}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
            >
              {filteredCategories.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    positionsReady && isComponentReady && scrollToCategory(index)
                  }
                  disabled={!positionsReady || !isComponentReady}
                  style={[
                    styles.categoryButton,
                    selectedCategory === index && styles.activeCategoryButton,
                    (!positionsReady || !isComponentReady) && { opacity: 0.5 },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === index && styles.activeCategoryButtonText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* Barra inferior del carrito */}
      {cart.length > 0 && !selectedProduct && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>
            {totalItems} Product{totalItems > 1 ? 's' : ''}
          </Text>
          <Text style={styles.cartText}>$ {totalAmount}</Text>
          <Text style={styles.cartText}>
            {orderType === "Order-in" ? "Dine-in" : orderType}
          </Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('CartScreen', { orderType, shop })}
          >
            <Text style={styles.cartButtonText}>Go to cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ShopScreen;

// Estilos complementarios
const extraStyles = StyleSheet.create({
  noProductsContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noProductsIcon: {
    fontSize: 32,
    color: '#999',
    marginBottom: 8,
  },
  noProductsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  noProductsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
