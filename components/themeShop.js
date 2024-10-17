import { StyleSheet } from 'react-native';

const commonStyles = {
  safeArea: {
    flex: 1,
  },
  shopInfoContainer: {
    padding: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -60,
    alignItems: 'center',
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  shopInfoDetails: {
    marginTop: -30,
    paddingHorizontal: 0,
    borderRadius: 10,
    padding: 10,
    width: '90%',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shopImage: {
    width: '100%',
    height: 150,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  shopAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopAddress: {
    fontSize: 14,
    marginLeft: 4,
  },
  shopDistance: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingAndOrderTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  shopRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  shopRating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
  },
  shopRatingOpinions: {
    fontSize: 12,
    marginLeft: 4,
  },
  shopRatingArrow: {
    marginLeft: 8,
    fontSize: 16,
  },
  shopInfoLeft: {
    flex: 1,
    alignItems: 'flex-start',
    paddingRight: 20,
  },
  shopInfoRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  shopHours: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  headerContainer: {
    width: '100%',
    height: 250,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 0,
    marginTop: -30,
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
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    fontFamily: 'sans-serif-medium',
  },
  headerTitle1: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bgtitle1: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'sans-serif',
    width: '80%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
    fontFamily: 'sans-serif-medium',
  },
  categoryScrollContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  categorySeparator: {
    height: 1,
    width: '100%',
    alignSelf: 'center',
    marginTop: 10,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  productCard: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
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
  },
  productDescription: {
    fontSize: 12,
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
  },
  cartText: {
    fontSize: 14,
    fontFamily: 'sans-serif',
  },
  cartButton: {
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stickyCategoryList: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 0,
  },
  categoryButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 5,
    marginBottom: 0,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  categoryButtonText1: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
  },
  activeCategoryButton: {
  borderBottomWidth: 2,
  borderBottomColor: '#FFC107',
},
  activeCategoryButtonText: {
    color: '#FFC107',
  },
  categoryListContainer: {
    paddingVertical: 30,
  },
  discountSectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  discountDetails: {
    flex: 1,
    marginLeft: 10,
  },
  discountPercentage: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  discountProduct: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  discountDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  headerImage: {
    width: '100%',
    height: 300,
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'sans-serif-medium',
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
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
  },
  orderTypeButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTypeButtonsRow: {
    flexDirection: 'row',
  },
  orderTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
  orderTypeText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedOrderTypeButton: {
    borderColor: '#FFC107',
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stickyBackButton: {
    padding: 8,
  },
  stickyHeaderText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    backgroundColor: '#FFFFFF',
  },
  shopInfoContainer: {
    ...commonStyles.shopInfoContainer,
    backgroundColor: '#FFFFFF',
  },
  shopName: {
    ...commonStyles.shopName,
    color: '#333333',
  },
  shopInfoDetails: {
    ...commonStyles.shopInfoDetails,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
  },
  shopAddress: {
    ...commonStyles.shopAddress,
    color: '#666666',
  },
  shopDistance: {
    ...commonStyles.shopDistance,
    color: '#999999',
  },
  shopRatingContainer: {
    ...commonStyles.shopRatingContainer,
    backgroundColor: '#fff4db',
    shadowColor: '#000000',
  },
  shopRating: {
    ...commonStyles.shopRating,
    color: '#333333',
  },
  shopRatingOpinions: {
    ...commonStyles.shopRatingOpinions,
    color: '#666666',
  },
  shopRatingArrow: {
    ...commonStyles.shopRatingArrow,
    color: '#666666',
  },
  shopHours: {
    ...commonStyles.shopHours,
    color: '#999999',
  },
  orderTypeButton: {
    ...commonStyles.orderTypeButton,
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
  },
  orderTypeText: {
    ...commonStyles.orderTypeText,
    color: '#8C6D00',
  },
  selectedOrderTypeButton: {
    ...commonStyles.selectedOrderTypeButton,
    backgroundColor: '#FFE082',
  },
  categoryButtonText: {
    ...commonStyles.categoryButtonText,
    color: '#000000',
  },
  categoryButtonText1: {
    ...commonStyles.categoryButtonText1,
    color: '#000000',
  },
  activeCategoryButtonText: {
    ...commonStyles.activeCategoryButtonText,
    color: '#FFC107',
  },
  categorySeparator: {
    ...commonStyles.categorySeparator,
    backgroundColor: '#CCCCCC',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
  },
  productName: {
    ...commonStyles.productName,
    color: '#000000',
  },
  productDescription: {
    ...commonStyles.productDescription,
    color: '#666666',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#000000',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#000000',
  },
  quantityButton: {
    ...commonStyles.quantityButton,
    backgroundColor: '#FFC107',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#CCCCCC',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#333333',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#333333',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
    shadowColor: '#000000',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    ...commonStyles.modalContent,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
  },
  modalText: {
    ...commonStyles.modalText,
    color: '#333333',
  },
  modalButton:{
    ...commonStyles.modalButton,
    backgroundColor: '#FFC107',
  },
  modalButtonText: {
    ...commonStyles.modalButtonText,
    color: '#333333',
  },
  stickyCategoryList: {
    ...commonStyles.stickyCategoryList,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#B0B0B0',
    shadowColor: '#000000',
    paddingTop:30
  },
  stickyHeaderText: {
    ...commonStyles.stickyHeaderText,
    color: '#333333',
  },
  backButton: {
    ...commonStyles.backButton,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  stickyBackButton: {
    ...commonStyles.stickyBackButton,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#FFFFFF',
  },
  bgtitle1: {
    ...commonStyles.bgtitle1,
    backgroundColor: '#000000',
  },
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    backgroundColor: '#121212',
  },
  shopInfoContainer: {
    ...commonStyles.shopInfoContainer,
    backgroundColor: '#1E1E1E',
  },
  shopName: {
    ...commonStyles.shopName,
    color: '#FFFFFF',
  },
  categoryListContainer:{
    padding:35
  },
  shopInfoDetails: {
    ...commonStyles.shopInfoDetails,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
  },
  shopAddress: {
    ...commonStyles.shopAddress,
    color: '#B3B3B3',
  },
  shopDistance: {
    ...commonStyles.shopDistance,
    color: '#B3B3B3',
  },
  shopRatingContainer: {
    ...commonStyles.shopRatingContainer,
    backgroundColor: '#2A2A2A',
    shadowColor: '#000000',
  },
  shopRating: {
    ...commonStyles.shopRating,
    color: '#FFFFFF',
  },
  shopRatingOpinions: {
    ...commonStyles.shopRatingOpinions,
    color: '#B3B3B3',
  },
  shopRatingArrow: {
    ...commonStyles.shopRatingArrow,
    color: '#B3B3B3',
  },
  shopHours: {
    ...commonStyles.shopHours,
    color: '#B3B3B3',
  },
  orderTypeButton: {
    ...commonStyles.orderTypeButton,
    backgroundColor: '#2A2A2A',
    borderColor: '#444444',
  },
  orderTypeText: {
    ...commonStyles.orderTypeText,
    color: '#000',
  },
  selectedOrderTypeButton: {
    ...commonStyles.selectedOrderTypeButton,
    backgroundColor: '#FFC107',
  },
  categoryButtonText: {
    ...commonStyles.categoryButtonText,
    color: '#FFFFFF',
  },
  categoryButtonText1: {
    ...commonStyles.categoryButtonText1,
    color: '#FFFFFF',
  },
  activeCategoryButtonText: {
    ...commonStyles.activeCategoryButtonText,
    color: '#FFC107',
  },
  categorySeparator: {
    ...commonStyles.categorySeparator,
    backgroundColor: '#333333',
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
  },
  productName: {
    ...commonStyles.productName,
    color: '#FFFFFF',
  },
  productDescription: {
    ...commonStyles.productDescription,
    color: '#B3B3B3',
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#FFFFFF',
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#FFFFFF',
  },
  quantityButton: {
    ...commonStyles.quantityButton,
    backgroundColor: '#FFC107',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#FFFFFF',
  },
  categoryTitle:{
    ...commonStyles.categoryTitle,
    color: '#fff',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#000000',
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#FFC107',
    shadowColor: '#000000',
  },
  modalContainer: {
    ...commonStyles.modalContainer,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    ...commonStyles.modalContent,
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
  },
  modalText: {
    ...commonStyles.modalText,
    color: '#FFFFFF',
  },
  modalButton:{
    ...commonStyles.modalButton,
    backgroundColor: '#FFC107',
  },
  modalButtonText: {
    ...commonStyles.modalButtonText,
    color: '#000000',
  },
  stickyCategoryList: {
    ...commonStyles.stickyCategoryList,
    backgroundColor: '#121212',
    borderBottomColor: '#333333',
    shadowColor: '#000000',
    paddingTop:30
  },
  stickyHeaderText: {
    ...commonStyles.stickyHeaderText,
    paddingTop:30,
    color: '#FFFFFF',
  },
  backButton: {
    ...commonStyles.backButton,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  stickyBackButton: {
    ...commonStyles.stickyBackButton,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#FFFFFF',
  },
  bgtitle1: {
    ...commonStyles.bgtitle1,
    backgroundColor: '#000000',
  },
});

export { stylesLight, stylesDark };

