import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { API_URL } from '@env';
import Axios from 'react-native-axios';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, Gift } from 'lucide-react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;

const ProductCard = ({ promotion, user, token, shop }) => {
  const navigation = useNavigation();
  const [userPromo, setUserPromo] = useState(null);

  useEffect(() => {
    const fetchUserPromotions = async () => {
      const data = {
        user_id: user.id,
        promotion_id: promotion[0].id,
      };
      try {
        const response = await Axios.post(`${API_URL}/api/promotions/getUserPromotions`, { data }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserPromo(response.data);
      } catch (error) {
        console.error('Error fetching user promotions:', error);
      }
    };
    fetchUserPromotions();
  }, [user.id, promotion, token]);

  const purchaseCount = userPromo?.purchaseCount || 0;

  const availablePrizes = promotion.reduce((acc, promo) => {
    if (purchaseCount >= promo.quantity) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const goPromoScreen = () => {
    navigation.navigate('PromoMealScreen', { promotion, userPromo, shopName: shop.name });
  };

  return (
    <TouchableOpacity onPress={goPromoScreen}>
      <Animated.View 
        style={styles.cardContainer} 
        entering={FadeIn.duration(500)}
        layout={Layout.springify()}
      >
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
