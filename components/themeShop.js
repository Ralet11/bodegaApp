import { StyleSheet } from 'react-native';

const commonStyles = {
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80,
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
    width: '80%',
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
    marginTop: 1,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#000',
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
  discountSectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  discountSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'sans-serif-medium',
  },
  discountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
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
    color: '#006400',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discountProduct: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  discountDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontWeight: 'bold',
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
    marginBottom:10,
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

  // Estilos para el detalle del producto
  productDetailContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  productDetailImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productDetailName: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  productDetailDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'sans-serif',
    marginBottom: 16,
    textAlign: 'center',
  },
  productDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  addToCartButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'sans-serif-medium',
  },
  backToProducts: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 20,
    fontFamily: 'sans-serif',
  },

  // Estilos para extras
  extrasContainer: {
    marginTop: 20,
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 10,
  },
  extraSection: {
    marginBottom: 20,
  },
  extraTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium',
    marginBottom: 10,
  },
  requiredText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'sans-serif',
    marginLeft: 5,
  },
  optionButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: '#D4B048',
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'sans-serif',
    color: '#333',
  },
  selectedOptionText: {
    color: '#4A148C',
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#1a1a1a', // Fondo oscuro
  },
  productDetailPrice: {color: "white"},
  orderTypeContainer: {
    ...commonStyles.orderTypeContainer,
  },
  discountProduct: {
    color: "white"
  },
  discountPrice: {
 color: "white"
  },
  discountSectionContainer: {
    ...commonStyles.discountSectionContainer,
    backgroundColor: '#000',

  },
  categoryContainer: {
    ...commonStyles.container,
  },
  sectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#E5E5E5', // Letras claras para contraste
  },
  offerCard: {
    ...commonStyles.offerCard,
    backgroundColor: '#2b2b2b', // Tarjetas en un tono oscuro
  },
  categoryTitle: {
    ...commonStyles.categoryTitle,
    color: '#E5E5E5', // Letras claras
  },
  productCard: {
    ...commonStyles.productCard,
    backgroundColor: '#2b2b2b',
  },
  productName: {
    ...commonStyles.productName,
    color: '#E5E5E5', // Letras claras
  },
  productPrice: {
    ...commonStyles.productPrice,
    color: '#E5E5E5', // Letras claras
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: '#E5E5E5',
  },
  cartContainer: {
    ...commonStyles.cartContainer,
    backgroundColor: '#2b2b2b',
    borderTopColor: '#3d3d3d', // Ligeramente más oscuro para diferenciación
  },
  cartText: {
    ...commonStyles.cartText,
    color: '#E5E5E5',
  },
  cartButton: {
    ...commonStyles.cartButton,
    backgroundColor: '#FFC107',
// Botón oscuro
  },
  cartButtonText: {
    ...commonStyles.cartButtonText,
    color: '#000', // Letras claras en el botón
  },
  fab: {
    ...commonStyles.fab,
    backgroundColor: '#3d3d3d', // Botón oscuro
  },
  categoryListContainer: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
  },
  modalContent: {
    backgroundColor: '#2b2b2b',
    shadowColor: '#000000', // Sombra negra para mantener la oscuridad
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
    color: '#E5E5E5', // Letras claras
  },
  modalButtonText: {
    color: '#000', // Letras claras en el botón del modal
  },
  discountSectionTitle: {
    ...commonStyles.discountSectionTitle,
    color: '#E5E5E5',
  },
  discountCard: {
    ...commonStyles.discountCard,
    backgroundColor: '#2b2b2b',
  },
  discountTitle: {
    ...commonStyles.discountTitle,
    color: '#E5E5E5',
  },
  discountDescription: {
    ...commonStyles.discountDescription,
    color: '#B0BEC5', // Letras en un gris claro para menor contraste
  },
  discountValidity: {
    ...commonStyles.discountValidity,
    color: '#B0BEC5', // Letras en gris claro
  },
  discountType: {
    ...commonStyles.discountType,
    color: '#B0BEC5', // Letras en gris claro
  },
  discountBlockCard: {
    ...commonStyles.discountBlockCard,
    backgroundColor: '#2b2b2b',
  },

  // Estilos específicos para el detalle del producto en modo oscuro
  productDetailContainer: {
    ...commonStyles.productDetailContainer,
    backgroundColor: '#1a1a1a',
  },
  productDetailName: {
    ...commonStyles.productDetailName,
    color: '#E5E5E5',
  },
  productDetailDescription: {
    ...commonStyles.productDetailDescription,
    color: '#B0BEC5',
  },
  addToCartButton: {
    ...commonStyles.addToCartButton,
    backgroundColor: '#FFC107', // Fondo oscuro para el botón
  },
  addToCartButtonText: {
    ...commonStyles.addToCartButtonText,
    color: '#000', // Letras claras en el botón
  },
  backToProducts: {
    ...commonStyles.backToProducts,
    color: '#E5E5E5', // Letras claras para volver a productos
  },

  // Estilos para extras en modo oscuro
  extrasContainer: {
    ...commonStyles.extrasContainer,
    backgroundColor: '#2b2b2b',
  },
  extraTitle: {
    ...commonStyles.extraTitle,
    color: '#E5E5E5',
  },
  optionButton: {
    ...commonStyles.optionButton,
    backgroundColor: '#3d3d3d', // Fondo oscuro para los botones de opciones
  },
  selectedOptionButton: {
    ...commonStyles.selectedOptionButton,
    backgroundColor: '#D4B048', // Fondo ligeramente más claro para opción seleccionada
  },
  optionText: {
    ...commonStyles.optionText,
    color: '#E5E5E5',
  },
  selectedOptionText: {
    ...commonStyles.selectedOptionText,
    color: '#000',
  },
  requiredText: {
    ...commonStyles.requiredText,
    color: '#B0BEC5', // Letras en gris claro
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  orderTypeContainer: {
    ...commonStyles.orderTypeContainer
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
    marginTop: 20,
    backgroundColor: 'white',
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

  // Estilos específicos para el detalle del producto en modo claro
  productDetailContainer: {
    ...commonStyles.productDetailContainer,
    backgroundColor: '#fff',
  },
  productDetailName: {
    ...commonStyles.productDetailName,
    color: '#333',
  },
  productDetailDescription: {
    ...commonStyles.productDetailDescription,
    color: '#666',
  },
  addToCartButton: {
    ...commonStyles.addToCartButton,
    backgroundColor: '#FFC107',
  },
  addToCartButtonText: {
    ...commonStyles.addToCartButtonText,
    color: '#333',
  },
  backToProducts: {
    ...commonStyles.backToProducts,
    color: '#007AFF',
  },

  // Estilos específicos para extras en modo claro
  extrasContainer: {
    ...commonStyles.extrasContainer,
    backgroundColor: '#f1f1f1',
  },
  extraTitle: {
    ...commonStyles.extraTitle,
    color: '#333',
  },
  optionButton: {
    ...commonStyles.optionButton,
    backgroundColor: '#E0E0E0',
  },
  selectedOptionButton: {
    ...commonStyles.selectedOptionButton,
    backgroundColor: '#D4B048',
  },
  optionText: {
    ...commonStyles.optionText,
    color: '#333',
  },
  selectedOptionText: {
    ...commonStyles.selectedOptionText,
    color: '#4A148C',
  },
  requiredText: {
    ...commonStyles.requiredText,
    color: 'black',
  },
});

export { stylesDark, stylesLight };
