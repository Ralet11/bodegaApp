import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
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

  console.log(adjustedPurchaseCounts, "adjusted");

  return (
    <ScrollView style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eat & Earn</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="question-circle" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.highlightedText}>
          {adjustedPurchases}
          <Text style={styles.normalText}> total purchases</Text>
        </Text>
        <Text style={styles.locationText}>{shopName}</Text>
      </View>

      {promotion.map((promotionItem, index) => {
        const purchasesLeft = promotionItem.quantity - adjustedPurchases;

        const handleClaimReward = () => {
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
          <View key={index} style={styles.productContainer}>
            <Image source={{ uri: promotionItem.product.img }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{promotionItem.product.name}</Text>
              <View style={styles.iconsContainer}>
                {[...Array(promotionItem.quantity)].map((_, i) => (
                  <Icon 
                    key={i} 
                    name={i < Math.min(adjustedPurchases, promotionItem.quantity) ? "certificate" : "circle-o"} 
                    size={width * 0.04}
                    color={i < Math.min(adjustedPurchases, promotionItem.quantity) ? styles.primaryColor : "#E0E0E0"} 
                    style={styles.icon} 
                  />
                ))}
              </View>
              {!isProductInCart(promotionItem.product.id) ? (
                <TouchableOpacity
                  style={[styles.button, adjustedPurchases >= promotionItem.quantity ? styles.activeButton : styles.disabledButton]}
                  onPress={handleClaimReward}
                  disabled={adjustedPurchases < promotionItem.quantity}
                >
                  <Text style={styles.buttonText}>
                    {adjustedPurchases >= promotionItem.quantity 
                      ? "Claim Reward" 
                      : `${purchasesLeft} more purchase(s)`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.claimedContainer}>
                  <Text style={styles.claimedText}>Reward claimed!</Text>
                  <Icon name="check-circle" size={20} color="#28A745" />
                </View>
              )}
            </View>
          </View>
        );
      })}

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  primaryColor: '#FFB300', // Warm yellow color
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
    width: '100%',
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#000',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  highlightedText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#FFB300', // Updated to warm yellow
    textAlign: 'center',
  },
  normalText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#3D3D3D',
  },
  locationText: {
    fontSize: width * 0.045,
    color: '#3D3D3D',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF6E3',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    width: '100%',
    padding: width * 0.03,
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  productImage: {
    width: width * 0.3,
    height: width * 0.2,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginLeft: width * 0.05,
    justifyContent: 'center',
  },
  productName: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  iconsContainer: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
  },
  icon: {
    marginRight: width * 0.01,
  },
  button: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeButton: {
    backgroundColor: '#FFB300', // Updated to warm yellow
  },
  disabledButton: {
    backgroundColor: '#D3D3D3',
  },
  buttonText: {
    color: '#FFF',
    fontSize: width * 0.035,
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  claimedText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#28A745',
    marginRight: width * 0.02,
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalHeaderImage: {
    width: '80%',
    height: height * 0.22,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: width * 0.045,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#FFB300', // Updated to warm yellow
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
  },
});

export default PromoMealScreen;