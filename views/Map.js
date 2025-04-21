"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
  Animated,
  Linking,
  Platform,
} from "react-native";
import { Image } from "expo-image";                // ← expo‑image
import MapView, { Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import isEqual from "lodash.isequal";
import Axios from "react-native-axios";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 60;
const GOOGLE_API_KEY = "AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc";

export default function MapViewComponent() {
  const dispatch   = useDispatch();
  const navigation = useNavigation();
  const insets     = useSafeAreaInsets();

  const address         = useSelector((s) => s?.user?.address?.formatted_address) || "";
  const shopsByCategory = useSelector((s) => s?.setUp?.shopsDiscounts || {}, isEqual);

  const [region, setRegion]                     = useState(null);
  const [marker, setMarker]                     = useState(null);
  const [selectedIdx, setSelectedIdx]           = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [selectedTag, setSelectedTag]           = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [allTags, setAllTags]                   = useState([]);
  const [distances, setDistances]               = useState({});

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const flatRef   = useRef();

  /* ────────────── A N I M A T I O N ────────────── */
  useEffect(() => {
    const show = selectedIdx !== null;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: show ? 1 : 0, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: show ? 1 : 0, speed: 12, bounciness: 8,  useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: show ? 1 : 0.5, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [selectedIdx, fadeAnim, slideAnim, scaleAnim]);

  /* ────────────── L O C A T I O N ────────────── */
  useEffect(() => {
    (async () => {
      const setCoords = (lat, lng) => {
        setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.015, longitudeDelta: 0.0121 });
        setMarker({ latitude: lat, longitude: lng });
      };

      if (!address) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { setPermissionDenied(true); setLoading(false); return; }
        const loc = await Location.getCurrentPositionAsync({});
        setCoords(loc.coords.latitude, loc.coords.longitude);
      } else {
        const res  = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`);
        const json = await res.json();
        if (json.results.length) {
          const loc = json.results[0].geometry.location;
          setCoords(loc.lat, loc.lng);
        }
      }
      setLoading(false);
    })();
  }, [address]);

  /* ────────────── S H O P   F I L T E R ────────────── */
  const filterShops = useCallback(() => {
    let arr = Array.isArray(shopsByCategory) ? shopsByCategory : Object.values(shopsByCategory).flat();
    arr = arr.filter((s) => s.orderIn);
    if (selectedTag) arr = arr.filter((s) => s.tags?.some((t) => t.id === selectedTag.id));
    return arr;
  }, [shopsByCategory, selectedTag]);

  const shops = useMemo(() => filterShops(), [filterShops]);

  /* ────────────── D I S T A N C E S ────────────── */
  useEffect(() => {
    (async () => {
      if (!address) return;
      const obj = {};
      for (const s of shops) {
        try {
          const { data } = await Axios.get(
            `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(address)}&destinations=${encodeURIComponent(
              s.address
            )}&key=${GOOGLE_API_KEY}`
          );
          const km = data.rows[0].elements[0].distance.value / 1000;
          const mi = km * 0.621371;
          if (mi <= 20) obj[s.id] = `${mi.toFixed(2)} mi`;
        } catch {}
      }
      setDistances(obj);
    })();
  }, [address, shops]);

  /* ────────────── T A G S ────────────── */
  useEffect(() => {
    const arr = Array.isArray(shopsByCategory) ? shopsByCategory : Object.values(shopsByCategory).flat();
    const map = new Map();
    arr.forEach((s) => s.tags?.forEach((t) => !map.has(t.id) && map.set(t.id, t)));
    setAllTags(Array.from(map.values()));
  }, [shopsByCategory]);

  /* ────────────── H A N D L E R S ────────────── */
  const openAddressMaps = (addr) => {
    const enc = encodeURIComponent(addr);
    const url = Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${enc}`
      : `https://www.google.com/maps/search/?api=1&query=${enc}`;
    Linking.openURL(url);
  };

  const navigateToShop = (shop) => {
    navigation.navigate("Shop", { shop });
    setSelectedIdx(null);
  };

  const navPrev = () => selectedIdx > 0 && setSelectedIdx((i) => i - 1);
  const navNext = () => selectedIdx < shops.length - 1 && setSelectedIdx((i) => i + 1);

  /* ────────────── R E N D E R ────────────── */
  return (
    <SafeAreaView style={styles.container}>
      {/* ───── T A G   B A R ───── */}
      <BlurView intensity={100} style={[styles.headerContainer, { marginTop: insets.top }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollView}
        >
          {allTags.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setSelectedTag((p) => (p?.id === t.id ? null : t))}
              style={[styles.tagButton, selectedTag?.id === t.id && styles.selectedTagButton]}
            >
              <Text style={[styles.tagText, selectedTag?.id === t.id && styles.selectedTagText]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurView>

      {/* ───── M A P ───── */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={{ uri: "https://assets5.lottiefiles.com/packages/lf20_X7WDCg.json" }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        </View>
      ) : permissionDenied ? (
        <View style={styles.permissionDeniedContainer}>
          <LottieView
            source={{ uri: "https://assets5.lottiefiles.com/packages/lf20_sB03tR.json" }}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.permissionDeniedText}>Location access is required.</Text>
        </View>
      ) : (
        region && (
          <MapView style={styles.map} region={region}>
            {marker && (
              <Marker coordinate={marker}>
                <FontAwesome5 name="map-pin" size={24} color="#4A90E2" />
              </Marker>
            )}
            {shops.map((s, i) => (
              <Marker
                key={s.id}
                coordinate={{ latitude: s.lat, longitude: s.lng }}
                onPress={() => setSelectedIdx(i)}
                calloutEnabled={false}
              >
                <View style={styles.shopMarkerContainer}>
                  {s.logo ? (
                    <Image
                      source={{ uri: s.logo }}
                      style={styles.shopMarkerImage}
                      contentFit="cover"
                      cachePolicy="immutable"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.defaultMarker}>
                      <FontAwesome5 name="store" size={18} color="#fff" />
                    </View>
                  )}
                </View>
              </Marker>
            ))}
          </MapView>
        )
      )}

      {/* ───── C A R D S ───── */}
      {selectedIdx !== null && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] }) },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <FlatList
            ref={flatRef}
            data={shops}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            keyExtractor={(item) => `${item.id}`}
            initialScrollIndex={selectedIdx}
            getItemLayout={(d, i) => ({ length: width, offset: width * i, index: i })}
            onScrollToIndexFailed={(i) =>
              setTimeout(() => flatRef.current?.scrollToIndex({ index: i.index, animated: true }), 500)
            }
            renderItem={({ item }) => (
              <View style={styles.pageContainer}>
                <View style={styles.modernCardContainer}>
                  {/* ─── I M A G E ─── */}
                  <View style={styles.modernImageWrapper}>
                    <Image
                      source={{ uri: item.placeImage }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      cachePolicy="immutable"
                      transition={250}
                    />
                    <View style={styles.imageOverlay} />
                    <TouchableOpacity
                      style={styles.modernCloseButton}
                      onPress={() => setSelectedIdx(null)}
                    >
                      <FontAwesome5 name="times" size={16} color="#fff" />
                    </TouchableOpacity>
                    {item.discountPercentage && (
                      <View style={styles.modernDiscountBadge}>
                        <Text style={styles.modernDiscountText}>{item.discountPercentage}% OFF</Text>
                      </View>
                    )}
                  </View>

                  {/* ─── C O N T E N T ─── */}
                  <View style={styles.modernCardContent}>
                    <View style={styles.modernTitleRow}>
                      <Text style={styles.modernCardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      {!!item.rating && (
                        <View style={styles.modernRatingContainer}>
                          <Text style={styles.modernRatingText}>{item.rating.toFixed(1)}</Text>
                          <FontAwesome5 name="star" size={12} color="#FF9900" />
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.modernAddressRow}
                      onPress={() => openAddressMaps(item.address)}
                    >
                      <FontAwesome5 name="map-marker-alt" size={12} color="#FF9900" />
                      <Text style={styles.modernAddressText} numberOfLines={2}>
                        {item.address}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.modernBottomRow}>
                      {distances[item.id] && (
                        <View style={styles.modernDistanceContainer}>
                          <FontAwesome5 name="walking" size={12} color="#666" />
                          <Text style={styles.modernDistanceText}>{distances[item.id]}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.modernViewButton}
                        onPress={() => navigateToShop(item)}
                      >
                        <Text style={styles.modernViewButtonText}>View Store</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
          {selectedIdx > 0 && <Arrow dir="left"  onPress={navPrev} />}
          {selectedIdx < shops.length - 1 && <Arrow dir="right" onPress={navNext} />}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* ───────────────────────── H E L P E R S ───────────────────────── */

const Arrow = ({ dir, onPress }) => (
  <TouchableOpacity
    style={[styles.modernNavButton, dir === "left" ? styles.modernLeftButton : styles.modernRightButton]}
    onPress={onPress}
  >
    <FontAwesome5 name={`chevron-${dir}`} size={16} color="#fff" />
  </TouchableOpacity>
);

/* ───────────────────────── S T Y L E S ───────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  headerContainer: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: "rgba(255,255,255,0.9)" },
  tagsScrollView: { paddingVertical: 10, paddingHorizontal: 15 },
  tagButton: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: "#f0f0f0", borderRadius: 20, marginRight: 10 },
  selectedTagButton: { backgroundColor: "#FF9900" },
  tagText: { fontSize: 14, color: "#333" },
  selectedTagText: { color: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  lottieAnimation: { width: 200, height: 200 },
  permissionDeniedContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  permissionDeniedText: { fontSize: 16, color: "#ff6b6b", textAlign: "center", marginTop: 20 },
  shopMarkerContainer: { alignItems: "center", justifyContent: "center", position: "relative" },
  shopMarkerImage: { width: 46, height: 46, borderRadius: 23, borderColor: "#FF9900", borderWidth: 2 },
  defaultMarker: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#FF9900", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  cardContainer: { position: "absolute", left: 0, right: 0, bottom: Platform.OS === "ios" ? 180 : 100, zIndex: 10 },
  pageContainer: { width, justifyContent: "center", alignItems: "center" },
  modernCardContainer: { width: CARD_WIDTH, height: 230, borderRadius: 12, backgroundColor: "#fff", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  modernImageWrapper: { width: "100%", height: 100, position: "relative" },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  modernCloseButton: { position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 10 },
  modernDiscountBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "#FF9900", paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4 },
  modernDiscountText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  modernCardContent: { flex: 1, padding: 12, justifyContent: "space-between" },
  modernTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modernCardTitle: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1, marginRight: 8 },
  modernRatingContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF8E7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modernRatingText: { fontSize: 12, fontWeight: "bold", color: "#333", marginRight: 4 },
  modernAddressRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 6 },
  modernAddressText: { fontSize: 12, color: "#666", marginLeft: 6, flex: 1, lineHeight: 16 },
  modernBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  modernDistanceContainer: { flexDirection: "row", alignItems: "center" },
  modernDistanceText: { fontSize: 12, color: "#666", marginLeft: 4 },
  modernViewButton: { backgroundColor: "#FF9900", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  modernViewButtonText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  modernNavButton: { position: "absolute", top: "50%", marginTop: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  modernLeftButton: { left: 10 },
  modernRightButton: { right: 10 },
});
