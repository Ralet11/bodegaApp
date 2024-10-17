import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert, Modal, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cart.slice'; // Asegúrate de ajustar esta importación según tu setup

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const PromoMealScreen = ({ route, navigation }) => {
  const { promotion, userPromo, product, shopName } = route.params; // Receive data from navigation
  const cart = useSelector(state => state.cart.items); // Access cart from global state
  const dispatch = useDispatch();

  // Detect the color scheme (light or dark mode)
  const colorScheme = useColorScheme();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  if (!promotion || promotion.length === 0) {
    return null; // If there's no promotion, return nothing
  }

  const { quantity } = promotion[0];
  const purchasesLeft = quantity - (userPromo?.purchaseCount || 0);

  // Check if the promoted product is already in the cart
  const isProductInCart = cart.some(item => item.id === product.id && item.promotion);

  // Function to handle claiming the reward
  const handleClaimReward = () => {
    if (purchasesLeft > 0) {
      Alert.alert("You have not yet reached the required purchases to claim the reward.");
      return;
    }

    // Add the product to the cart with price and currentPrice set to 0.00
    dispatch(addToCart({
      ...product,
      quantity: 1,
      selectedExtras: {}, // Add extras if needed
      price: '0.00', // Reward price is 0.00
      currentPrice: '0.00', // Set currentPrice to 0.00
      promotion: true, // Mark as promotion
    }));

    // Alert and navigate back
    Alert.alert("Success", "Reward has been added to your cart!");
    navigation.goBack();
  };

  const styles = lightStyles;

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={styles.iconColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eat & Earn</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="question-circle" size={24} color={styles.iconColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        {/* Round image at the top */}
        <Image source={{ uri: product?.img }} style={styles.roundImage} />
      </View>

      <View style={styles.infoContainer}>
        {/* Text showing how many purchases are left */}
        <Text style={styles.highlightedText}>
          {purchasesLeft > 0 ? purchasesLeft : "0"} 
          <Text style={styles.normalText}> purchases left</Text>
        </Text>
        <Text style={styles.locationText}>{shopName}</Text>
      </View>

      {/* Progress icons */}
      <View style={styles.iconsContainer}>
        {[...Array(quantity)].map((_, index) => (
          <Icon 
            key={index} 
            name={index < (userPromo?.purchaseCount || 0) ? "certificate" : "circle-o"} 
            size={width * 0.06}  // Proportional to screen width
            color={index < (userPromo?.purchaseCount || 0) ? "#F4A261" : "#E0E0E0"} 
            style={styles.icon} 
          />
        ))}
      </View>

      <View style={styles.productContainer}>
        {/* Product image */}
        <Image source={{ uri: product?.img }} style={styles.productImage} />

        <View style={styles.productInfo}>
          {/* Product name */}
          <Text style={styles.productName}>{product?.name}</Text>

          {/* Claim button or 'Reward claimed' */}
          {!isProductInCart ? (
            <TouchableOpacity
              style={[styles.button, purchasesLeft > 0 ? styles.disabledButton : styles.activeButton]}
              onPress={handleClaimReward}
              disabled={purchasesLeft > 0}
            >
              <Text style={styles.buttonText}>{purchasesLeft > 0 ? `${purchasesLeft} more purchases` : "Claim Reward"}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.claimedContainer}>
              <Text style={styles.claimedText}>Reward claimed!</Text>
              <Icon name="check-circle" size={20} color="#28A745" />
            </View>
          )}
        </View>
      </View>

      {/* Modal for help information */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header image in the modal */}
            <Image 
              source={require('./../assets/promoImage.png')} // Cambia esta ruta según la ubicación correcta de tu imagen
              style={styles.modalHeaderImage}
            />
            <Text style={styles.modalTitle}>Earn Free Meals with Bodega+!</Text>
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

// Light mode styles
const lightStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: height * 0.08,
    paddingHorizontal: width * 0.05,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  iconColor: '#000',
  imageContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  roundImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    borderWidth: 4,
    borderColor: '#F4A261',
    marginBottom: height * 0.01,
    resizeMode: 'cover',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  highlightedText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#F4A261',
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
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.03,
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
  button: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeButton: {
    backgroundColor: '#28A745',
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
  // Modal styles
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
    backgroundColor: '#000',
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

// Dark mode styles
const darkStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    paddingVertical: height * 0.08,
    paddingHorizontal: width * 0.05,
    justifyContent: 'flex-start',
    alignItems: 'center',
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
    color: '#FFFFFF',
  },
  iconColor: '#FFFFFF',
  imageContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  roundImage: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: (width * 0.4) / 2,
    borderWidth: 4,
    borderColor: '#F4A261',
    marginBottom: height * 0.01,
    resizeMode: 'cover',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  highlightedText: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#F4A261',
    textAlign: 'center',
  },
  normalText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  locationText: {
    fontSize: width * 0.045,
    color: '#CCCCCC',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.03,
  },
  productContainer: {
    flexDirection: 'row',
    backgroundColor: '#333333',
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
    color: '#FFFFFF',
    marginBottom: height * 0.01,
  },
  button: {
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeButton: {
    backgroundColor: '#28A745',
  },
  disabledButton: {
    backgroundColor: '#505050',
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
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#2C2C2C',
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
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: width * 0.045,
    textAlign: 'center',
    color: '#CCCCCC',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#000000',
    fontSize: width * 0.045,
  },
});

export default PromoMealScreen;
