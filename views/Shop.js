// ShopScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image,
  SafeAreaView, ScrollView, BackHandler, useColorScheme, Animated, Linking, Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../redux/slices/cart.slice';
import { setCurrentShop } from '../redux/slices/currentShop.slice';
import CartSkeletonLoader from '../components/SkeletonLoaderCart';
import ShopContent from '../components/ShopContent';
import ShopContentOrderIn from '../components/ShopContentOrderIn';
import { stylesDark, stylesLight } from '../components/themeShop';

import PromoCard from '../components/PromoMealCard';
import DiscountDetailScreen from '../components/DiscountDetail';
import ProductDetail from '../components/ProductDetail'; // Import the product detail component

const ShopScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart.items);
  const colorScheme = useColorScheme();
  const user = useSelector((state) => state?.user?.userInfo?.data?.client);
  const token = useSelector((state) => state?.user?.userInfo.data.token);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState('Pick-up');
  const [discounts, setDiscounts] = useState([]);
  const [groupedDiscounts, setGroupedDiscounts] = useState([]);
  const scrollViewRef = useRef(null);
  const [promotion, setPromotion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showStickyCategoryScroll, setShowStickyCategoryScroll] = useState(false);
  const [categoryListY, setCategoryListY] = useState(0);
  const stickyAnim = useRef(new Animated.Value(0)).current;
  const categoryRefs = useRef([]);
  const categoryPositions = useRef([]);
  const params = route.params || {};
  const shop = params.shop || null;
  const orderTypeParam = params.orderTypeParam || null;
  const orderDetails = params.orderDetails || null;
  const styles = stylesLight;
  const isNavigatingBack = useRef(false);
  const [reviews, setReviews] = useState([]);

  const [positionsReady, setPositionsReady] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  useEffect(() => {
    setIsComponentReady(true);
  }, []);

  useEffect(() => {
    if (orderDetails && Array.isArray(orderDetails) && orderDetails.length > 0) {
      orderDetails.forEach(product => {
        dispatch(addToCart({
          ...product,
          quantity: product.quantity || 1,
          selectedExtras: product.selectedExtras || {},
          price: product.currentPrice || product.price,
        }));
      });
    }
  }, [orderDetails, dispatch]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/reviews/getByLocal/${shop.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReviews(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [shop.id, token]);

  useEffect(() => {
    if (orderTypeParam !== undefined) {
      switch (orderTypeParam) {
        case 0:
          setOrderType('Order-in');
          break;
        case 1:
          setOrderType('Pick-up');
          break;
        case 2:
          setOrderType('Delivery');
          break;
        default:
          setOrderType('Pick-up');
          break;
      }
    }
  }, [orderTypeParam]);

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
        const discounts = response.data;
        setDiscounts(discounts);
        setGroupedDiscounts(groupDiscountsByCategory(discounts)); // Always group discounts
      } catch (error) {
        console.log(error);
      }
    };

    if (shop?.id) {
      fetchCategories();
      fetchDiscounts();
    }
  }, [shop?.id, token]);

  useEffect(() => {
    const getPromotionByShop = async () => {
      try {
        const response = await Axios.get(`${API_URL}/api/promotions/getByLocal/${shop?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPromotion(response.data);
        console.log(response.data, "response promotion");
      } catch (error) {
        console.log(error);
      }
    };
    getPromotionByShop();
  }, []);

  useEffect(() => {
    if (shop?.id) {
      dispatch(setCurrentShop(shop.id));
    }
  }, [dispatch, shop?.id]);

  const openAddressInGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Cannot open the URL:", url);
        }
      })
      .catch((err) => console.error("Error trying to open the URL:", err));
  };

  const scrollToCategory = (index) => {
    if (!positionsReady || !isComponentReady) {
      console.log('Component is not ready to scroll yet');
      return;
    }

    if (scrollViewRef.current && categoryPositions.current[index] !== undefined) {
      setSelectedCategory(index);
      const positionY = categoryPositions.current[index];
      scrollViewRef.current.scrollTo({ y: positionY - categoryListY, animated: true });
    } else {
      console.log('scrollViewRef.current or categoryPositions.current is not available');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isNavigatingBack.current) {
          return true;
        }
        isNavigatingBack.current = true;

        if (!selectedProduct && !selectedDiscount) {
          if (cart.length > 0) {
            dispatch(clearCart());
            navigation.goBack();
            return true;
          } else {
            navigation.goBack();
            return true;
          }
        } else {
          setSelectedProduct(null);
          setSelectedDiscount(null);
          isNavigatingBack.current = false;
          return true;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      navigation.addListener('beforeRemove', (e) => {
        if (isNavigatingBack.current) {
          return;
        }
        isNavigatingBack.current = true;

        const actionType = e.data.action.type;

        if (cart.length > 0) {
          if (actionType === 'POP') {
            // User is going back (including slide-back gesture), empty the cart without asking
            dispatch(clearCart());
            navigation.dispatch(e.data.action);
          } else {
            // For other actions, show the alert
            e.preventDefault();
            Alert.alert(
              "Empty Cart",
              "If you go back, your cart will be emptied. Do you want to continue?",
              [
                {
                  text: "Cancel",
                  onPress: () => {
                    isNavigatingBack.current = false;
                  },
                  style: "cancel"
                },
                {
                  text: "Continue",
                  onPress: () => {
                    dispatch(clearCart());
                    navigation.dispatch(e.data.action);
                  }
                }
              ]
            );
          }
        } else {
          navigation.dispatch(e.data.action);
        }
      });

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        navigation.removeListener('beforeRemove', () => { });
        isNavigatingBack.current = false;
      };
    }, [cart, selectedProduct, selectedDiscount, navigation, dispatch])
  );

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
  };

  const handleScroll = (event) => {
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

  const handleAddToCart = (product, quantity) => {
    const selectedExtras = Object.values(selectedOptions);
    if (orderType === 'Order-in' && product.delivery === 0) {
      alertCannotAddProduct();
    } else if ((orderType === 'Pick-up' || orderType === 'Delivery') && product.delivery === 1) {
      alertCannotAddProduct();
    } else {
      dispatch(addToCart({ ...product, quantity, extras: selectedExtras }));
      closeProductDetail();
    }
  };

  const handleAddDiscountToCart = (discount) => {
    const discountedPrice = ((discount.product.price * (100 - discount.percentage)) / 100).toFixed(2);

    if (discount.product.extras && discount.product.extras.length > 0) {
      setSelectedDiscount(discount);
    } else {
      dispatch(addToCart({
        ...discount.product,
        quantity: 1,
        currentPrice: discountedPrice,
        price: discountedPrice,
        discount: true
      }));
    }
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedOptions({});
  };

  const closeDiscountDetail = () => {
    setSelectedDiscount(null);
    setSelectedOptions({});
  };

  const groupDiscountsByCategory = (discounts) => {
    const grouped = {};
    discounts.forEach(discount => {
      const categoryId = discount.product?.category?.id || 'uncategorized';
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category: discount.product.category || { id: 'uncategorized', name: 'Uncategorized' },
          discounts: []
        };
      }
      grouped[categoryId].discounts.push(discount);
    });
    return Object.values(grouped);
  };

  const goReviewScreen = () => {
    navigation.navigate('ReviewSceen', { shop, reviews });
  };

  useEffect(() => {
    setGroupedDiscounts(groupDiscountsByCategory(discounts));
  }, [discounts]);

  useEffect(() => {
    Animated.timing(stickyAnim, {
      toValue: showStickyCategoryScroll ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showStickyCategoryScroll]);

  const renderOrderTypeButtons = () => {
    if (shop?.orderIn && shop?.pickUp) {
      return (
        <>
          {/* Button for Order-in */}
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'Order-in' && styles.selectedOrderTypeButton]}
            onPress={() => handleOrderTypeChange('Order-in')}
          >
            <FontAwesome name="cutlery" size={15} color={orderType === 'Order-in' ? '#8C6D00' : '#333'} />
            <Text style={styles.orderTypeText}>Dine-in</Text>
          </TouchableOpacity>

          {/* Button for Pick-up */}
          <TouchableOpacity
            style={[styles.orderTypeButton, orderType === 'Pick-up' && styles.selectedOrderTypeButton]}
            onPress={() => handleOrderTypeChange('Pick-up')}
          >
            <FontAwesome name="shopping-basket" size={15} color={orderType === 'Pick-up' ? '#8C6D00' : '#333'} />
            <Text style={styles.orderTypeText}>Pick-up</Text>
          </TouchableOpacity>
        </>
      );
    } else if (shop?.delivery?.orderIn) {
      return (
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Order-in' && styles.selectedOrderTypeButton]}
          onPress={() => handleOrderTypeChange('Order-in')}
        >
          <FontAwesome name="cutlery" size={15} color={orderType === 'Order-in' ? '#8C6D00' : '#333'} />
          <Text style={styles.orderTypeText}>Order-in</Text>
        </TouchableOpacity>
      );
    } else if (shop?.delivery?.pickUp) {
      return (
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Pick-up' && styles.selectedOrderTypeButton]}
          onPress={() => handleOrderTypeChange('Pick-up')}
        >
          <FontAwesome name="shopping-basket" size={15} color={orderType === 'Pick-up' ? '#8C6D00' : '#333'} />
          <Text style={styles.orderTypeText}>Pick-up</Text>
        </TouchableOpacity>
      );
    }
  };
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.reduce((total, item) => total + item.currentPrice * item.quantity, 0).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      {selectedProduct ? (
        // Render only the ProductDetail if a product is selected
        <ProductDetail
          product={selectedProduct}
          onAddToCart={handleAddToCart}
          onBack={closeProductDetail}
        />
      ) : selectedDiscount ? (
        // Render only the DiscountDetailScreen if a discount is selected
        <DiscountDetailScreen
          discount={selectedDiscount}
          onAddToCart={handleAddDiscountToCart}
          onBack={closeDiscountDetail}
          shop={shop}
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
            {/* Header with Image */}
            <View style={styles.headerImageContainer}>
              <Image
                source={{ uri: shop?.deliveryImage }}
                style={styles.headerImage}
              />
              <TouchableOpacity
                onPress={() => {
                  // Only proceed if there's no selected product or discount
                  if (!selectedProduct && !selectedDiscount) {
                    if (cart.length > 0) {
                      dispatch(clearCart());
                      navigation.goBack();
                    } else {
                      navigation.goBack();
                    }
                  } else {
                    setSelectedProduct(null);
                    setSelectedDiscount(null);
                  }
                }}
                style={styles.backButton}
              >
                <FontAwesome name="arrow-left" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* Shop Information */}
            {!selectedProduct && !selectedDiscount && (
              <View style={styles.shopInfoContainer}>
                <Text style={styles.shopName}>{shop?.name}</Text>
                <TouchableOpacity
                  style={styles.shopAddressContainer}
                  onPress={() => openAddressInGoogleMaps(shop?.address)}
                >
                  <FontAwesome name="map-marker" size={18} color="#000" />
                  <Text style={styles.shopAddress}>{shop?.address}</Text>
                </TouchableOpacity>
                {!selectedProduct && !selectedDiscount && (
                  <View style={styles.ratingAndOrderTypeContainer}>
                    <TouchableOpacity onPress={goReviewScreen} style={styles.shopRatingContainer}>
                      <FontAwesome name="star" size={14} color="#ffcc00" />
                      <Text style={styles.shopRating}>{shop?.rating?.toFixed(1)}</Text>
                      <Text style={styles.shopRatingOpinions}>({reviews.length || 0})</Text>
                      <FontAwesome name="chevron-right" style={styles.shopRatingArrow} />
                    </TouchableOpacity>
                    <View style={styles.orderTypeButtonsContainer}>
                      {renderOrderTypeButtons()}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Categories */}
            {!selectedProduct && !selectedDiscount && (
              <View
                style={styles.categoryListContainer}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setCategoryListY(layout.y);
                }}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.contentContainer}
                >
                  {groupedDiscounts.map((item, index) => (
                    <TouchableOpacity
                      key={item.category?.id || item.id}
                      onPress={() => positionsReady && isComponentReady && scrollToCategory(index)}
                      disabled={!positionsReady || !isComponentReady}
                      style={[
                        styles.categoryButton,
                        selectedCategory === index && styles.activeCategoryButton,
                        (!positionsReady || !isComponentReady) && { opacity: 0.5 },
                      ]}
                    >
                      <Text style={[
                        styles.categoryButtonText1,
                        selectedCategory === index && styles.activeCategoryButtonText
                      ]}>
                        {item.category?.name || item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.categorySeparator} />
              </View>
            )}

            {promotion && (
              <PromoCard user={user} shop={shop} token={token} promotion={promotion} />
            )}

            {/* Category Content */}
            {loading ? (
              <CartSkeletonLoader />
            ) : (
              (orderType === 'Order-in' || orderType === 'Pick-up') ? (
                <ShopContentOrderIn
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  selectedDiscount={selectedDiscount}
                  setSelectedDiscount={setSelectedDiscount}
                  cart={cart}
                  discounts={groupedDiscounts} // Already grouped regardless of orderType
                  handleAddToCart={handleAddToCart}
                  handleAddDiscountToCart={handleAddDiscountToCart}
                  selectedOptions={selectedOptions}
                  setSelectedOptions={setSelectedOptions}
                  closeProductDetail={closeProductDetail}
                  closeDiscountDetail={closeDiscountDetail}
                  orderType={orderType}
                  categoryRefs={categoryRefs}
                  categoryPositions={categoryPositions}
                  setPositionsReady={setPositionsReady}
                  promotion={promotion}
                  shop={shop}
                />
              ) : (
                <ShopContent
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  selectedDiscount={selectedDiscount}
                  setSelectedDiscount={setSelectedDiscount}
                  categories={categories}
                  cart={cart}
                  discounts={discounts}
                  handleAddToCart={handleAddToCart}
                  handleAddDiscountToCart={handleAddDiscountToCart}
                  selectedOptions={selectedOptions}
                  setSelectedOptions={setSelectedOptions}
                  closeProductDetail={closeProductDetail}
                  closeDiscountDetail={closeDiscountDetail}
                  categoryRefs={categoryRefs}
                  categoryPositions={categoryPositions}
                  setPositionsReady={setPositionsReady}
                  promotion={promotion}
                  shop={shop}
                />
              )
            )}
          </ScrollView>

          {/* Sticky Category Scroll */}
          <Animated.View style={[
            styles.stickyCategoryList,
            {
              opacity: stickyAnim,
              transform: [{
                translateY: stickyAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                })
              }]
            }
          ]}>
            <View style={styles.stickyHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyBackButton}>
                <FontAwesome name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={styles.stickyHeaderText}>
                  {shop?.name ?? ""}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
            >
              {(orderType === 'Order-in' ? groupedDiscounts : categories).map((item, index) => (
                <TouchableOpacity
                  key={item.category?.id || item.id}
                  onPress={() => positionsReady && isComponentReady && scrollToCategory(index)}
                  disabled={!positionsReady || !isComponentReady}
                  style={[
                    styles.categoryButton,
                    selectedCategory === index && styles.activeCategoryButton,
                    (!positionsReady || !isComponentReady) && { opacity: 0.5 },
                  ]}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === index && styles.activeCategoryButtonText
                  ]}>
                    {item.category?.name || item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {cart.length > 0 && !selectedProduct && !selectedDiscount && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>{totalItems} Product{totalItems > 1 ? 's' : ''}</Text>
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
