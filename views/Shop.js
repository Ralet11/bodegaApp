// ShopScreen.js
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

const ShopScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const user = useSelector(state => state?.user?.userInfo?.data?.client);
  const token = useSelector(state => state?.user?.userInfo.data.token);

  // Estados locales
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState('Pick-up');
  const [promotion, setPromotion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Para la barra sticky de categorías
  const [showStickyCategoryScroll, setShowStickyCategoryScroll] = useState(false);
  const [categoryListY, setCategoryListY] = useState(0);
  const categoryRefs = useRef([]);
  const categoryPositions = useRef([]);
  const [positionsReady, setPositionsReady] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  // Animación para la barra sticky
  const stickyAnimValue = useRef(new Animated.Value(0)).current;

  // Reseñas
  const [reviews, setReviews] = useState([]);

  // Parámetros de navegación
  const params = route.params || {};
  const shop = params.shop || null;
  const orderTypeParam = params.orderTypeParam;
  const orderDetails = params.orderDetails || null;

  // Estilos (por ahora forzados a light)
  // const styles = colorScheme === 'dark' ? stylesDark : stylesLight;
  const styles = stylesLight;

  // Control para evitar doble back
  const isNavigatingBack = useRef(false);

  //----------------------------------------------------------------
  // Efectos
  //----------------------------------------------------------------

  // Montaje inicial
  useEffect(() => {
    setIsComponentReady(true);
  }, []);

  // Si `orderDetails` trae productos, se agregan al carrito.
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

  // Obtener reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        if (shop?.id) {
          const response = await Axios.get(`${API_URL}/api/reviews/getByLocal/${shop.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setReviews(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, [shop?.id, token]);

  // Ajustar el `orderType` según `orderTypeParam`
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

  // Obtener categorías + productos
  useEffect(() => {
    const fetchCategories = async () => {
      if (!shop?.id) return;
      try {
        setLoading(true);
        const response = await Axios.get(`${API_URL}/api/local/${shop.id}/categories`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [shop?.id]);

  // Obtener promoción
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

  // Setear la tienda actual en Redux
  useEffect(() => {
    if (shop?.id) {
      dispatch(setCurrentShop(shop.id));
    }
  }, [dispatch, shop?.id]);

  // Efecto para animar el valor cuando showStickyCategoryScroll cambia
  useEffect(() => {
    Animated.timing(stickyAnimValue, {
      toValue: showStickyCategoryScroll ? 1 : 0,
      duration: 200, // Prueba un valor entre 150 y 300 para ver qué tan fluido se siente
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showStickyCategoryScroll, stickyAnimValue]);

  //----------------------------------------------------------------
  // Manejo de la navegación "back"
  //----------------------------------------------------------------
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isNavigatingBack.current) return true;
        isNavigatingBack.current = true;

        // Si no hay producto seleccionado
        if (!selectedProduct) {
          // Carrito con ítems => lo vaciamos y navegamos a Main
          if (cart.length > 0) {
            dispatch(clearCart());
            dispatch(setAuxCart());
            navigation.navigate('Main');
            return true;
          } else {
            // Carrito vacío => directo a Main
            dispatch(setAuxCart());
            navigation.navigate('Main');
            return true;
          }
        } else {
          // Había un producto abierto => cerramos detalle
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

  // Manejo "antes de salir" (swipe iOS/back)
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener('beforeRemove', e => {
      const isSwipeBack = e.data.action.type === 'POP';
      if (cart.length > 0) {
        e.preventDefault();
        Alert.alert('Empty Cart', 'If you go back, your cart will be emptied. Do you want to continue?', [
          ...(isSwipeBack
            ? []
            : [
                {
                  text: 'Cancel',
                  onPress: () => {
                    isNavigatingBack.current = false;
                  },
                  style: 'cancel',
                },
              ]),
          {
            text: 'Accept',
            onPress: () => {
              dispatch(clearCart());
              dispatch(setAuxCart());
              navigation.dispatch(e.data.action);
            },
          },
        ]);
      } else {
        dispatch(setAuxCart());
        navigation.dispatch(e.data.action);
      }
    });

    return () => {
      navigation.removeListener('beforeRemove', beforeRemoveListener);
    };
  }, [navigation, cart, dispatch]);

  //----------------------------------------------------------------
  // Funciones
  //----------------------------------------------------------------

  // Abrir dirección en Google Maps
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

  // Manejo de scroll
  const scrollViewRef = useRef(null);
  const handleScroll = event => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY >= categoryListY) {
      setShowStickyCategoryScroll(true);
    } else {
      setShowStickyCategoryScroll(false);
    }

    // Detectar a qué categoría pertenece la posición de scroll
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

  // Scroll a categoría según índice
  const scrollToCategory = index => {
    if (!positionsReady || !isComponentReady) {
      console.log('Componente no listo para scrollear todavía');
      return;
    }
    if (scrollViewRef.current && categoryPositions.current[index] !== undefined) {
      setSelectedCategory(index);
      const positionY = categoryPositions.current[index];
      // Ajuste según la altura donde inicia la lista
      scrollViewRef.current.scrollTo({ y: positionY - categoryListY, animated: true });
    } else {
      console.log('No se pudo hacer scroll (refs no disponibles aún).');
    }
  };

  // Manejo de cambio en orderType
  const handleOrderTypeChange = type => {
    setOrderType(type);
  };

  // Agregar producto al carrito
  const handleAddToCart = (product, quantity) => {
    dispatch(
      addToCart({
        ...product,
        quantity,
        // finalPrice si existe, de lo contrario price
        price: product.finalPrice ?? product.price,
      })
    );
    closeProductDetail();
  };

  // Cerrar el detalle de producto
  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedOptions({});
  };

  // Ir a la pantalla de reseñas
  const goReviewScreen = () => {
    navigation.navigate('ReviewSceen', { shop, reviews });
  };

  // Botones de Order Type
  const renderOrderTypeButtons = () => {
    return (
      <>
        {shop?.orderIn && (
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'Order-in' && styles.selectedOrderTypeButton]}
            onPress={() => handleOrderTypeChange('Order-in')}
          >
            <FontAwesome name="cutlery" size={15} color={orderType === 'Order-in' ? '#8C6D00' : '#333'} />
            <Text style={styles.orderTypeText}>Dine-in</Text>
          </TouchableOpacity>
        )}
        {shop?.pickUp && (
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'Pick-up' && styles.selectedOrderTypeButton]}
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

  // Calcular totales para la barra del carrito
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0).toFixed(2);

  //----------------------------------------------------------------
  // Render principal
  //----------------------------------------------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      {selectedProduct ? (
        // Si hay un producto seleccionado, renderizamos solo el detalle:
        <ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} onBack={closeProductDetail} />
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
              <Image source={{ uri: shop?.deliveryImage }} style={styles.headerImage} />
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

            {/* Info de la tienda */}
            <View style={styles.shopInfoContainer}>
              <Text style={styles.shopName}>{shop?.name}</Text>
              <TouchableOpacity
                style={styles.shopAddressContainer}
                onPress={() => openAddressInGoogleMaps(shop?.address)}
              >
                <FontAwesome name="map-marker" size={18} color="#000" />
                <Text style={styles.shopAddress}>{shop?.address}</Text>
              </TouchableOpacity>

              {/* Rating y tipos de orden */}
              <View style={styles.ratingAndOrderTypeContainer}>
                <TouchableOpacity onPress={goReviewScreen} style={styles.shopRatingContainer}>
                  <FontAwesome name="star" size={14} color="#ffcc00" />
                  <Text style={styles.shopRating}>{shop?.rating?.toFixed(1)}</Text>
                  <Text style={styles.shopRatingOpinions}>({reviews.length || 0})</Text>
                  <FontAwesome name="chevron-right" style={styles.shopRatingArrow} />
                </TouchableOpacity>
                <View style={styles.orderTypeButtonsContainer}>{renderOrderTypeButtons()}</View>
              </View>
            </View>

            {/* Lista de categorías */}
            <View
              style={styles.categoryListContainer}
              onLayout={event => {
                const layout = event.nativeEvent.layout;
                setCategoryListY(layout.y);
              }}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentContainer}>
                {categories.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => positionsReady && isComponentReady && scrollToCategory(index)}
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

            {/* PromoCard (si existe) */}
            {promotion && Object.keys(promotion).length > 0 && (
              <PromoCard user={user} shop={shop} token={token} promotion={promotion} />
            )}

            {/* Contenido principal (categorías y productos) */}
            {loading ? (
              <CartSkeletonLoader />
            ) : (
              <ShopContentOrderIn
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                cart={cart}
                handleAddToCart={handleAddToCart}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                closeProductDetail={closeProductDetail}
                orderType={orderType}
                categoryRefs={categoryRefs}
                categoryPositions={categoryPositions}
                setPositionsReady={setPositionsReady}
                promotion={promotion}
                shop={shop}
                categories={categories}
              />
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
              {categories.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => positionsReady && isComponentReady && scrollToCategory(index)}
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

      {/* Barra del carrito (abajo) */}
      {cart.length > 0 && !selectedProduct && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>
            {totalItems} Product{totalItems > 1 ? 's' : ''}
          </Text>
          <Text style={styles.cartText}>$ {totalAmount}</Text>
          <Text style={styles.cartText}>{orderType}</Text>
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
