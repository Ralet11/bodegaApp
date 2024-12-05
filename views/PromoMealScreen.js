import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import { ArrowLeft, HelpCircle, ShoppingBag, Gift, Check } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice';
import { setAdjustedPurchaseCount } from '../redux/slices/promotion.slice';

const { width, height } = Dimensions.get('window');

const PromoMealScreen = ({ route, navigation }) => {
  const { promotion, userPromo, shopName, shopId } = route.params;
  const cart = useSelector(state => state.cart.items);
  const adjustedPurchaseCounts = useSelector(state => state.promotions.adjustedPurchaseCounts || {});
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);

  const initialPurchases = userPromo?.purchaseCount || 0;
  const adjustedPurchases = adjustedPurchaseCounts[shopId] !== undefined ? adjustedPurchaseCounts[shopId] : initialPurchases;

  const isProductInCart = (productId) => {
    return cart.some(item => item.id === productId && item.promotion);
  };

  const handleClaimReward = (promotionItem) => {
    const purchasesLeft = promotionItem.quantity - adjustedPurchases;
    if (purchasesLeft > 0) {
      Alert.alert("Not enough purchases", `You need ${purchasesLeft} more purchase(s) to claim this reward.`);
      return;
    }

    dispatch(addToCart({
      ...promotionItem.product,
      quantity: 1,
      selectedExtras: {},
      price: '0.00',
      currentPrice: '0.00',
      promotion: true,
    }));

    const newAdjustedPurchases = adjustedPurchases - promotionItem.quantity;
    dispatch(setAdjustedPurchaseCount({ shopId, adjustedPurchaseCount: newAdjustedPurchases }));

    Alert.alert("Success", "The reward has been added to your cart!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eat & Earn</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.helpButton}>
          <HelpCircle color="#000" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.purchaseInfo}>
          <ShoppingBag color="#FFB300" size={24} style={styles.purchaseIcon} />
          <Text style={styles.purchaseCountText}>{adjustedPurchases}</Text>
          <Text style={styles.purchaseLabel}>Purchases</Text>
        </View>
        <Text style={styles.shopName}>{shopName}</Text>
      </View>

      <ScrollView style={styles.content}>
        {promotion.map((promotionItem, index) => {
          const purchasesLeft = Math.max(0, promotionItem.quantity - adjustedPurchases);
          const isRewardAvailable = purchasesLeft === 0;
          const isRewardClaimed = isProductInCart(promotionItem.product.id);

          return (
            <View key={index} style={styles.rewardCard}>
              <Image source={{ uri: promotionItem.product.img }} style={styles.rewardImage} />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{promotionItem.product.name}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${Math.min((adjustedPurchases / promotionItem.quantity) * 100, 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {isRewardAvailable ? 'Reward Available!' : `${purchasesLeft} more purchase${purchasesLeft !== 1 ? 's' : ''} needed`}
                  </Text>
                </View>
                <Text style={styles.purchaseRequirement}>
                  {promotionItem.quantity} purchase{promotionItem.quantity !== 1 ? 's' : ''} required
                </Text>
                {!isRewardClaimed ? (
                  <TouchableOpacity
                    style={[styles.claimButton, !isRewardAvailable && styles.disabledButton]}
                    onPress={() => handleClaimReward(promotionItem)}
                    disabled={!isRewardAvailable}
                  >
                    <Text style={styles.claimButtonText}>
                      {isRewardAvailable ? 'Claim Reward' : 'Not Yet Available'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.claimedContainer}>
                    <Check color="#28A745" size={20} />
                    <Text style={styles.claimedText}>Reward claimed!</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image 
              source={require('./../assets/promoImage.png')}
              style={styles.modalHeaderImage}
            />
            <Text style={styles.modalTitle}>Earn free meals with Bodega+!</Text>
            <Text style={styles.modalText}>1. Eat at participating restaurants.</Text>
            <Text style={styles.modalText}>2. Collect purchases and rewards to unlock free meals.</Text>
            <Text style={styles.modalText}>3. Show your code at the restaurant to redeem your prize!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#000',
  },
  helpButton: {
    padding: 5,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  purchaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  purchaseIcon: {
    marginRight: width * 0.02,
  },
  purchaseCountText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#FFB300',
    marginRight: width * 0.02,
  },
  purchaseLabel: {
    fontSize: width * 0.04,
    color: '#666',
  },
  shopName: {
    fontSize: width * 0.04,
    fontWeight: '500',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: width * 0.05,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: height * 0.02,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rewardImage: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'cover',
  },
  rewardInfo: {
    flex: 1,
    padding: width * 0.03,
    justifyContent: 'space-between',
  },
  rewardName: {
    fontSize: width * 0.04,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  progressContainer: {
    marginBottom: height * 0.01,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: height * 0.005,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFB300',
  },
  progressText: {
    fontSize: width * 0.035,
    color: '#666',
  },
  purchaseRequirement: {
    fontSize: width * 0.035,
    color: '#333',
    marginBottom: height * 0.01,
  },
  claimButton: {
    backgroundColor: '#FFB300',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.03,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  claimButtonText: {
    color: '#FFF',
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimedText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#28A745',
    marginLeft: width * 0.02,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalHeaderImage: {
    width: '100%',
    height: height * 0.2,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: width * 0.04,
    textAlign: 'left',
    marginBottom: 10,
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});

export default PromoMealScreen;

