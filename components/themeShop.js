import { StyleSheet } from 'react-native';

const commonStyles = {
  safeArea: {
    flex: 1,
    
  },
  contentContainer: {
    paddingBottom: 80
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: 30,
  },
  backButton: {
    padding: 10,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'sans-serif-medium',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontFamily: 'sans-serif',
    width: "80%"
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shopRating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#ff9900',
    fontFamily: 'sans-serif',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    fontFamily: 'sans-serif-medium',
  },
  offersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  categoryContainer: {
    marginBottom: 5,
    paddingHorizontal: 20,
    backgroundColor: "white",
    paddingVertical:20
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  productCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,  // Ajusta el tamaño de la imagen según tus necesidades
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: "#000"
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
  },
  productPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  quantityText: {
    fontSize: 14,
    marginHorizontal: 8,
    fontFamily: 'sans-serif',
  },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
  },
  cartText: {
    fontSize: 14,
    fontFamily: 'sans-serif',
  },
  cartButton: {
    backgroundColor: '#FFC107',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#FFC107',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  categoryScrollContainer: {
    paddingVertical: 1,
    paddingLeft: 16,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#FFC107',
    borderRadius: 10,
    marginRight: 10,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'sans-serif-medium',
  },
  categoryListContainer: {
    
    paddingVertical: 5,
  
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  discountScrollContainer: {
    paddingVertical: 10,
    paddingLeft: 16,
    marginVertical: 10,
    backgroundColor: "white"
  },
  discountCard: {
    width: 220,
    height: 320,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 15,
    position: 'relative',
  },
  discountImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },
  discountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  discountDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  discountValidity: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  discountType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    textAlign: 'center',
  },
  discountBlockCard: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  discountBlockImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  firstContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 20,
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  productInitPrice: {
    color: '#8B0000',
    textDecorationLine: 'line-through',
    fontSize: 14,
    marginRight: 5,
  },
  productFinalPrice: {
    color: '#006400',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tag: {
    backgroundColor: '#e0f7e0',
    padding: 6,
    borderRadius: 5,
  },
  discountPercentage: {
    color: '#006400',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  discountDetails: {
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'sans-serif-medium',
    color: '#333',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FFC107',
    padding: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'sans-serif-medium',
    color: '#333',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 1,
    marginTop: 20,
  },
  orderTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 5,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#BDBDBD',
    marginHorizontal: 5,
  },
  selectedOrderTypeButton: {
    backgroundColor: '#FFE082',
    borderColor: '#FFC107',
  },
  orderTypeText: {
    marginLeft: 5,
    fontSize: 8,
    color: '#8C6D00',
    fontWeight: 'bold',
  },
  orderTypeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  orderTypeModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  orderTypeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'sans-serif-medium',
    color: '#333',
  },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  orderTypeOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#1c1c1c',
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#fff',
  },
  offerCard: {
    ...commonStyles.offerCard,
    backgroundColor: '#444',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#fff',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#333',
  },
  productName: {
    ...commonStyles.productName,
    color: '#fff',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#fff',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#fff',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#333',
    borderTopColor: '#444',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#fff',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#333',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
  },
  categoryListContainer: {
    backgroundColor: '#1c1c1c',
    paddingVertical: 10,
  },
  modalContent: {
    backgroundColor: '#444',
    shadowColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    color: '#fff',
  },
  modalButtonText: {
    color: '#fff',
  },
  discountSectionTitle: {
    ...commonStyles.discountSectionTitle,
    color: '#fff',
  },
  discountCard: {
    ...commonStyles.discountCard,
    backgroundColor: '#333',
  },
  discountTitle: {
    ...commonStyles.discountTitle,
    color: '#fff',
  },
  discountDescription: {
    ...commonStyles.discountDescription,
    color: '#ccc',
  },
  discountValidity: {
    ...commonStyles.discountValidity,
    color: '#999',
  },
  discountType: {
    ...commonStyles.discountType,
    color: '#999',
  },
  discountBlockCard: {
    ...commonStyles.discountBlockCard,
    backgroundColor: '#333',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#333',
  },
  offerCard: {
    ...commonStyles.offerCard,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#333',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#f8f8f8',
  },
  productName: {
    ...commonStyles.productName,
    color: '#000',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#000',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#000',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#f8f8f8',
    borderTopColor: '#ccc',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#333',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#333',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
  },
  categoryListContainer: {
    marginTop:20,
    backgroundColor: "white",
    paddingVertical: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    padding: 20,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalText: {
    color: '#333',
  },
  modalButtonText: {
    color: '#333',
  },
});

export { stylesDark, stylesLight };
