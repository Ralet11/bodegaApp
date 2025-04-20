"use client"

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react"
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native"
import LottieView from "lottie-react-native"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width * 0.48 // Ancho de la tarjeta

/* ===============  ANIMACIÓN RELOJ =============== */
const clockAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 24,
  h: 24,
  nm: "Clock Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Clock Face",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: { a: 0, k: 0, ix: 10 },
        p: { a: 0, k: [12, 12, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [20, 20], ix: 2 },
              p: { a: 0, k: [0, 0], ix: 3 },
              nm: "Ellipse Path 1",
              mn: "ADBE Vector Shape - Ellipse",
              hd: false,
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1], ix: 3 },
              o: { a: 0, k: 100, ix: 4 },
              w: { a: 0, k: 2, ix: 5 },
              lc: 1,
              lj: 1,
              ml: 4,
              bm: 0,
              nm: "Stroke 1",
              mn: "ADBE Vector Graphic - Stroke",
              hd: false,
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "Ellipse 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Minute Hand",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], h: 0 },
            { t: 60, s: [360], h: 0 },
          ],
          ix: 10,
        },
        p: { a: 0, k: [12, 12, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [1, 7], ix: 2 },
              p: { a: 0, k: [0, -3.5], ix: 3 },
              r: { a: 0, k: 0, ix: 4 },
              nm: "Rectangle Path 1",
              mn: "ADBE Vector Shape - Rect",
              hd: false,
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "Rectangle 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Hour Hand",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, ix: 11 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], h: 0 },
            { t: 60, s: [30], h: 0 },
          ],
          ix: 10,
        },
        p: { a: 0, k: [12, 12, 0], ix: 2 },
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [1.5, 5], ix: 2 },
              p: { a: 0, k: [0, -2.5], ix: 3 },
              r: { a: 0, k: 0, ix: 4 },
              nm: "Rectangle Path 1",
              mn: "ADBE Vector Shape - Rect",
              hd: false,
            },
            {
              ty: "fl",
              c: { a: 0, k: [1, 1, 1, 1], ix: 4 },
              o: { a: 0, k: 100, ix: 5 },
              r: 1,
              bm: 0,
              nm: "Fill 1",
              mn: "ADBE Vector Graphic - Fill",
              hd: false,
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0], ix: 2 },
              a: { a: 0, k: [0, 0], ix: 1 },
              s: { a: 0, k: [100, 100], ix: 3 },
              r: { a: 0, k: 0, ix: 6 },
              o: { a: 0, k: 100, ix: 7 },
              sk: { a: 0, k: 0, ix: 4 },
              sa: { a: 0, k: 0, ix: 5 },
              nm: "Transform",
            },
          ],
          nm: "Rectangle 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false,
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0,
    },
  ],
  markers: [],
}

const DiscountProductsScroll = ({ products = [], onProductPress }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const animationRefs = useRef({})

  

  // Actualizar hora cada segundo
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Filtrar productos activos
  const activeProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return products.filter((p) => {
      const schedule = p.discountSchedule?.[0]
      if (!schedule?.start || !schedule?.end) return false

      const [sH, sM] = schedule.start.split(":").map(Number)
      const [eH, eM] = schedule.end.split(":").map(Number)
      const now = currentTime

      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        sH,
        sM,
      )
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        eH,
        eM,
      )

      if (end <= start) end.setDate(end.getDate() + 1) // cruza medianoche

      return now >= start && now <= end
    })
  }, [products, currentTime])

  // Formatear tiempo restante
  const formatTimeRemaining = useCallback((ms) => {
    if (ms <= 0) return "00:00"
    const totalSec = Math.floor(ms / 1000)
    const hrs = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    const secs = totalSec % 60
    const pad = (n) => n.toString().padStart(2, "0")
    return hrs
      ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
      : `${pad(mins)}:${pad(secs)}`
  }, [])

  // Calcular millis restantes
  const calculateTimeLeft = useCallback(
    (schedule) => {
      const now = currentTime
      const [eH, eM] = schedule.end.split(":").map(Number)
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        eH,
        eM,
      )
      if (end <= now) end.setDate(end.getDate() + 1)
      return Math.max(0, end - now)
    },
    [currentTime],
  )

  const handleGoShop = (product) => {
console.log(product, "prod")
  }

  // Render tarjeta
  const renderProductCard = ({ item, index }) => {
    const schedule = item.discountSchedule?.[0]
    const timeLeftMs = calculateTimeLeft(schedule)
    const timeLeft = formatTimeRemaining(timeLeftMs)
    const urgent = timeLeftMs < 10 * 60 * 1000

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onProductPress?.(item)}
            style={styles.cardTouchable}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.img }} style={styles.productImage} />
              <View
                style={[
                  styles.timerContainer,
                  urgent && styles.urgentTimer,
                ]}
              >
                <LottieView
                  ref={(a) => {
                    if (a && !animationRefs.current[`anim_${index}`]) {
                      animationRefs.current[`anim_${index}`] = a
                      a.play()
                    }
                  }}
                  source={clockAnimation}
                  style={styles.clockAnimation}
                  autoPlay
                  loop
                  speed={0.3}
                />
                <Text style={styles.timerText}>{timeLeft}</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  -{item.discountPercentage}%
                </Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text numberOfLines={1} style={styles.productName}>
                {item.name}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>
                  ${item.price.toFixed(2)}
                </Text>
                <Text style={styles.finalPrice}>
                  ${item.finalPrice.toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity onPress={() => handleGoShop(product)} style={styles.buyButton}>
                <Text style={styles.buyButtonText}>View in Shop</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!activeProducts.length) return null

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Flash Deals</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeProducts}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductCard}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

/* ===============  ESTILOS  =============== */
const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  seeAllText: { fontSize: 12, color: "#F5A623", fontWeight: "600" },
  listContent: { paddingHorizontal: 12, paddingVertical: 4 },
  cardContainer: { width: CARD_WIDTH, marginRight: 12 },
  card: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#FEFEFE",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTouchable: { flex: 1 },
  imageContainer: { position: "relative", height: 125 },
  productImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  timerContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  urgentTimer: { backgroundColor: "rgba(255,0,0,0.85)" },
  clockAnimation: { width: 16, height: 16 },
  timerText: { color: "#fff", marginLeft: 3, fontSize: 10, fontWeight: "bold" },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#F5A623",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  discountBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  cardContent: { padding: 10 },
  productName: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  priceContainer: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  originalPrice: {
    fontSize: 12,
    color: "#888",
    textDecorationLine: "line-through",
    marginRight: 6,
  },
  finalPrice: { fontSize: 14, color: "#F5A623", fontWeight: "bold" },
  buyButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  buyButtonText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
})

export default DiscountProductsScroll
