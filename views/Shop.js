"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Animated,
  Linking,
  Easing,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";               // ← expo‑image
import { FontAwesome } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import Axios from "react-native-axios";
import { API_URL } from "@env";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, clearCart } from "../redux/slices/cart.slice";
import { setCurrentShop } from "../redux/slices/currentShop.slice";
import { setAuxCart } from "../redux/slices/setUp.slice";
import CartSkeletonLoader from "../components/SkeletonLoaderCart";
import ShopContentOrderIn from "../components/ShopContentOrderIn";
import { stylesLight } from "../components/themeShop";
import PromoCard from "../components/PromoMealCard";
import ProductDetail from "../components/ProductDetail";

const windowWidth   = Dimensions.get("window").width;
const HEADER_HEIGHT = (windowWidth * 9) / 16; // relación 16:9
const styles        = stylesLight;

const ShopScreen = () => {
  const route      = useRoute();
  const navigation = useNavigation();
  const dispatch   = useDispatch();

  /* ───── Redux ───── */
  const cart  = useSelector((s) => s.cart.items);
  const user  = useSelector((s) => s?.user?.userInfo?.data?.client);
  const token = useSelector((s) => s?.user?.userInfo?.data?.token);

  /* ───── Params ───── */
  const { shop = null, orderTypeParam, orderDetails = [] } = route.params || {};

  /* ───── Local state ───── */
  const [categories, setCategories]             = useState([]);
  const [filteredCategories, setFiltered]       = useState([]);
  const [selectedProduct, setSelectedProduct]   = useState(null);
  const [selectedOptions, setSelectedOptions]   = useState({});
  const [loading, setLoading]                   = useState(true);
  const [orderType, setOrderType]               = useState("Pick-up");
  const [promotion, setPromotion]               = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reviews, setReviews]                   = useState([]);

  /* ───── Sticky categories ───── */
  const [showSticky, setShowSticky] = useState(false);
  const [categoryY, setCategoryY]   = useState(0);
  const categoryRefs                = useRef([]);
  const categoryPositions           = useRef([]);
  const positionsReady              = useRef(false);
  const isReady                     = useRef(false);
  const stickyAnim                  = useRef(new Animated.Value(0)).current;
  const scrollRef                   = useRef(null);
  const navigatingBack              = useRef(false);

  /* ───── Effects ───── */
  useEffect(() => { isReady.current = true; }, []);

  useEffect(() => {
    if (orderDetails.length) {
      orderDetails.forEach((p) =>
        dispatch(
          addToCart({
            ...p,
            quantity: p.quantity || 1,
            selectedExtras: p.selectedExtras || {},
            price: p.currentPrice || p.price,
          })
        )
      );
    }
  }, [orderDetails, dispatch]);

  useEffect(() => {
    if (!shop?.id) return;
    (async () => {
      try {
        const { data } = await Axios.get(
          `${API_URL}/api/reviews/getByLocal/${shop.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [shop?.id, token]);

  useEffect(() => {
    setOrderType(orderTypeParam === 0 ? "Order-in" : "Pick-up");
  }, [orderTypeParam]);

  useEffect(() => {
    if (!shop?.id) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await Axios.get(`${API_URL}/api/local/${shop.id}/categories`);
        const cats = data.categories || [];
        setCategories(cats);
        setFiltered(cats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [shop?.id]);

  useEffect(() => {
    if (!shop?.id) return;
    (async () => {
      try {
        const { data } = await Axios.get(
          `${API_URL}/api/promotions/getByLocal/${shop.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPromotion(data || null);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [shop?.id, token]);

  useEffect(() => { shop?.id && dispatch(setCurrentShop(shop.id)); }, [dispatch, shop?.id]);

  useEffect(() => {
    Animated.timing(stickyAnim, {
      toValue: showSticky ? 1 : 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [showSticky, stickyAnim]);

  /* ───── Back handling ───── */
  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        if (navigatingBack.current) return true;
        navigatingBack.current = true;
        if (!selectedProduct) {
          dispatch(clearCart());
          dispatch(setAuxCart());
          navigation.navigate("Main");
          return true;
        }
        setSelectedProduct(null);
        navigatingBack.current = false;
        return true;
      };
      BackHandler.addEventListener("hardwareBackPress", onBack);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBack);
        navigatingBack.current = false;
      };
    }, [dispatch, navigation, selectedProduct])
  );

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", (e) => {
      dispatch(clearCart());
      dispatch(setAuxCart());
      navigation.dispatch(e.data.action);
    });
    return () => navigation.removeListener("beforeRemove", unsub);
  }, [navigation, dispatch]);

  /* ───── Handlers ───── */
  const handleScroll = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowSticky(y >= categoryY);
    categoryPositions.current.forEach((pos, i) => {
      if (
        pos <= y + categoryY + 10 &&
        (categoryPositions.current[i + 1] === undefined ||
          categoryPositions.current[i + 1] > y + categoryY + 10)
      ) {
        setSelectedCategory(i);
      }
    });
  };

  const scrollToCategory = (i) => {
    if (!positionsReady.current || !isReady.current) return;
    const y = categoryPositions.current[i];
    y !== undefined && scrollRef.current?.scrollTo({ y: y - categoryY, animated: true });
  };

  const openMaps = (addr) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
    Linking.openURL(url).catch(() => {});
  };

  const totalItems  = cart.reduce((t, i) => t + i.quantity, 0);
  const totalAmount = cart
    .reduce((s, i) => s + (i.finalPrice ?? 0) * i.quantity, 0)
    .toFixed(2);

  /* ───── Render ───── */
  return (
    <SafeAreaView style={styles.safeArea}>
      {selectedProduct ? (
        <ProductDetail
          product={selectedProduct}
          onAddToCart={(p, q) => {
            dispatch(addToCart({ ...p, quantity: q, price: p.finalPrice ?? p.price }));
            setSelectedProduct(null);
          }}
          onBack={() => setSelectedProduct(null)}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            nestedScrollEnabled
            style={{ flex: 1, backgroundColor: styles.container.backgroundColor }}
            scrollEventThrottle={16}
            onScroll={handleScroll}
          >
            {/* Header */}
            <View style={styles.headerImageContainer}>
              <Image
                source={{ uri: shop?.deliveryImage }}
                style={{ width: windowWidth, height: HEADER_HEIGHT }}
                contentFit="cover"
                cachePolicy="immutable"      // evita reutilizar archivos corruptos
                transition={250}
              />
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  dispatch(clearCart());
                  dispatch(setAuxCart());
                  navigation.navigate("Main");
                }}
              >
                <FontAwesome name="arrow-left" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Shop info */}
            <View style={styles.shopInfoContainer}>
              <Text style={styles.shopName}>{shop?.name}</Text>
              <TouchableOpacity
                style={styles.shopAddressContainer}
                onPress={() => openMaps(shop?.address)}
              >
                <FontAwesome name="map-marker" size={18} color="#000" />
                <Text style={styles.shopAddress}>{shop?.address}</Text>
              </TouchableOpacity>

              <View style={styles.ratingAndOrderTypeContainer}>
                <TouchableOpacity
                  style={styles.shopRatingContainer}
                  onPress={() => navigation.navigate("ReviewSceen", { shop, reviews })}
                >
                  <FontAwesome name="star" size={14} color="#ffcc00" />
                  <Text style={styles.shopRating}>{shop?.rating?.toFixed(1)}</Text>
                  <Text style={styles.shopRatingOpinions}>({reviews.length})</Text>
                  <FontAwesome name="chevron-right" style={styles.shopRatingArrow} />
                </TouchableOpacity>

                <View style={styles.orderTypeButtonsContainer}>
                  {shop?.orderIn && (
                    <OrderTypeBtn
                      title="Dine‑in"
                      active={orderType === "Order-in"}
                      onPress={() => setOrderType("Order-in")}
                    />
                  )}
                  {shop?.pickUp && (
                    <OrderTypeBtn
                      title="Pick‑up"
                      active={orderType === "Pick-up"}
                      onPress={() => setOrderType("Pick-up")}
                    />
                  )}
                </View>
              </View>
            </View>

            {/* Categories bar */}
            <View
              style={styles.categoryListContainer}
              onLayout={(e) => setCategoryY(e.nativeEvent.layout.y)}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.contentContainer}
              >
                {filteredCategories.map((c, i) => (
                  <CatButton
                    key={c.id}
                    label={c.name}
                    active={selectedCategory === i}
                    disabled={!positionsReady.current}
                    onPress={() => scrollToCategory(i)}
                  />
                ))}
              </ScrollView>
              <View style={styles.categorySeparator} />
            </View>

            {/* Promotion */}
            {/* {promotion && (
              <PromoCard user={user} shop={shop} token={token} promotion={promotion} />
            )} */}

            {/* Products / skeleton */}
            {loading ? (
              <CartSkeletonLoader />
            ) : filteredCategories.length ? (
              <ShopContentOrderIn
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                cart={cart}
                handleAddToCart={(p, q) =>
                  dispatch(addToCart({ ...p, quantity: q, price: p.finalPrice ?? p.price }))
                }
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                closeProductDetail={() => setSelectedProduct(null)}
                categories={filteredCategories}
                categoryRefs={categoryRefs}
                categoryPositions={categoryPositions}
                setPositionsReady={(v) => {
                  positionsReady.current = v;
                }}
                promotion={promotion}
                shop={shop}
              />
            ) : (
              <NoProducts />
            )}
          </ScrollView>

          {/* Sticky bar */}
          <Animated.View
            style={[
              styles.stickyCategoryList,
              {
                opacity: stickyAnim,
                transform: [
                  {
                    translateY: stickyAnim.interpolate({
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
                style={styles.stickyBackButton}
                onPress={() => navigation.navigate("Main")}
              >
                <FontAwesome name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={styles.stickyHeaderText}>{shop?.name}</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContainer}
            >
              {filteredCategories.map((c, i) => (
                <CatButton
                  key={c.id}
                  label={c.name}
                  active={selectedCategory === i}
                  disabled={!positionsReady.current}
                  onPress={() => scrollToCategory(i)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* Cart bar */}
      {cart.length > 0 && !selectedProduct && (
        <View style={styles.cartContainer}>
          <Text style={styles.cartText}>
            {totalItems} Product{totalItems > 1 ? "s" : ""}
          </Text>
          <Text style={styles.cartText}>$ {totalAmount}</Text>
          <Text style={styles.cartText}>
            {orderType === "Order-in" ? "Dine‑in" : "Pick‑up"}
          </Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("CartScreen", { orderType, shop })}
          >
            <Text style={styles.cartButtonText}>Go to cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ShopScreen;

/* ───── Helpers ───── */
const OrderTypeBtn = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[stylesLight.orderTypeButton, active && stylesLight.selectedOrderTypeButton]}
    onPress={onPress}
  >
    <FontAwesome
      name={title === "Dine‑in" ? "cutlery" : "shopping-basket"}
      size={15}
      color={active ? "#8C6D00" : "#333"}
    />
    <Text style={stylesLight.orderTypeText}>{title}</Text>
  </TouchableOpacity>
);

const CatButton = ({ label, active, disabled, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[
      stylesLight.categoryButton,
      active && stylesLight.activeCategoryButton,
      disabled && { opacity: 0.5 },
    ]}
  >
    <Text
      style={[
        stylesLight.categoryButtonText1,
        active && stylesLight.activeCategoryButtonText,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const NoProducts = () => (
  <View style={extraStyles.noProductsContainer}>
    <FontAwesome name="frown-o" style={extraStyles.noProductsIcon} />
    <Text style={extraStyles.noProductsTitle}>No Dishes Available</Text>
    <Text style={extraStyles.noProductsText}>
      We're updating our menu. Please check back soon!
    </Text>
  </View>
);

const extraStyles = StyleSheet.create({
  noProductsContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noProductsIcon:   { fontSize: 32, color: "#999", marginBottom: 8 },
  noProductsTitle:  { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  noProductsText:   { fontSize: 14, color: "#666", textAlign: "center", lineHeight: 20 },
});
