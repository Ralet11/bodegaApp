import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { API_URL } from '@env';
import Axios from 'react-native-axios';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { setAdjustedPurchaseCount } from '../redux/slices/promotion.slice';
import { ShoppingBag, Gift } from 'lucide-react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const ProductCard = ({ promotion, user, token, shop }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Leer el estado global
  const adjustedPurchaseCounts = useSelector((state) => state.promotions.adjustedPurchaseCounts || {});

  // Estado local para la promo del usuario
  const [userPromo, setUserPromo] = useState(null);

  useEffect(() => {
    const fetchUserPromotions = async () => {
      const data = {
        user_id: user.id,
        localId: shop.id,
      };

      try {
        const response = await Axios.post(`${API_URL}/api/promotions/getUserPromotions`, { data }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedPromo = response.data;
        setUserPromo(fetchedPromo);

        // Si no hay un valor en adjustedPurchaseCounts para este shopId, lo seteamos
        if (adjustedPurchaseCounts[shop.id] === undefined && fetchedPromo) {
          dispatch(setAdjustedPurchaseCount({
            shopId: shop.id,
            adjustedPurchaseCount: fetchedPromo.purchaseCount,
          }));
        }
      } catch (error) {
        console.error('Error fetching user promotions:', error);
      }
    };

    fetchUserPromotions();
  }, [user.id, promotion, token]);

  // Usar el valor ajustado del estado global si está definido, de lo contrario, usar el del backend
  const purchaseCount = adjustedPurchaseCounts[shop.id] !== undefined
    ? adjustedPurchaseCounts[shop.id]
    : userPromo?.purchaseCount || 0;

  const availablePrizes = promotion.reduce((acc, promo) => {
    if (purchaseCount >= promo.quantity) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const goPromoScreen = () => {
    navigation.navigate('PromoMealScreen', { promotion, userPromo, shopName: shop.name, shopId: shop.id });
  };

  return (
    <TouchableOpacity onPress={goPromoScreen}>
      <Animated.View 
        style={styles.cardContainer} 
        entering={FadeIn.duration(500)}
        layout={Layout.springify()}
      >
        <Text style={styles.titleText}>Eat & Earn</Text>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <ShoppingBag size={24} color="#F59E0B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.purchaseText}>Purchases</Text>
            <Text style={styles.countText}>{purchaseCount}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.prizeInfo}>
            <Gift size={16} color="#F59E0B" />
            <Text style={styles.prizeText}>{availablePrizes} prizes available</Text>
          </View>
          <View style={styles.viewPrizesButton}>
            <Text style={styles.buttonText}>View prizes</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: CARD_WIDTH,
  },
  titleText: {
    position: 'absolute',
    top: 8,
    right: 12,
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    opacity: 0.8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  purchaseText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 2,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#78350F',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeText: {
    fontSize: 12,
    color: '#92400E',
    marginLeft: 4,
  },
  viewPrizesButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProductCard;
