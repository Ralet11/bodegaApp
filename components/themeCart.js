import { StyleSheet } from 'react-native';

const commonStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    backgroundColor: '#FFCC00', // Color amarillo para el fondo
    paddingHorizontal: 4, // Tamaño del padding más pequeño
    paddingVertical: 2,
    borderRadius: 1,
  },
  quantityButtonText: {
    fontSize: 16, // Ajusta el tamaño del texto
    fontWeight: 'bold',
    color: '#000', // Texto negro
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  removeButton: {
    position: 'absolute',
    right: 30,
    top: '50%',
    transform: [{ translateY: -12 }], // Centra verticalmente el botón
    backgroundColor: 'transparent',
    padding: 10,
  },
  goBackButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 26,  // Aumentado para mayor impacto
    fontWeight: 'bold',
    color: '#333', // Color más oscuro para contraste
  },
  orderTypeContainer: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  orderTypeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  addressContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addressLabel: {
    fontSize: 18,  // Aumentado para mejor legibilidad
    fontWeight: '600',
    color: '#333',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,  // Añadido para separar del label
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  cartItemsContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  cartItemImage: {
    width: 70,  // Ajustado para mayor visibilidad
    height: 70,
    borderRadius: 10,
  },
  discountLabel: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffcc00',
    padding: 5,
    borderRadius: 5,
  },
  discountLabelText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 8,  // Ajustado para mayor visibilidad
  },
  promotionLabel: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#CCCCFF',
    padding: 5,
    borderRadius: 5,
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    fontSize: 18,  // Aumentado para mejor legibilidad
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 16,
    marginTop: 4,
    color: '#666',  // Color más suave para contraste
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  quantityText: {
    fontSize: 18,  // Aumentado para mejor visibilidad
    marginHorizontal: 10,
    color: '#333',
  },
  tipContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  tipLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tipButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  tipButtonSelected: {
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customTipInput: {
    marginTop: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,  // Aumentado para un diseño más espacioso
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 18,  // Aumentado para mejorar la legibilidad
    marginBottom: 8,
    color: '#333',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#A9A9A9',
  },
  freeText: {
    color: 'green',
    fontWeight: 'bold',
  },
  totalText: {
    fontSize: 20,  // Aumentado para destacar el total
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginTop: 10,
  },
  checkoutButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 14,  // Ajustado para mayor confort
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  checkoutButtonText: {
    color: '#1a1a1a',
    fontSize: 20,  // Aumentado para mayor impacto
    fontWeight: 'bold',
  },
  savingsContainer: {
    backgroundColor: '#fffbec',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffcc00',
    borderWidth: 1,
  },
  savingsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff6600',
  },
  adContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,  // Aumentado para mejor presencia
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  adTitle: {
    fontSize: 20,  // Aumentado para mayor impacto
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  adText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // This will create the dark overlay
  },
  largeModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: '95%',
    height: '95%', // Ocupa el 95% de la altura disponible
    alignSelf: 'center',
    justifyContent: 'space-between', // Distribuye el espacio entre el contenido y los botones
  },
  modalTitle: {
    fontSize: 22,  // Aumenta ligeramente el tamaño del título
    fontWeight: 'bold',
    marginBottom: 15, // Espacio generoso debajo del título
    textAlign: 'center', // Centra el título
  },
  modalScrollView: {
    flex: 1, // Deja que el contenido use todo el espacio disponible
  },
  modalSection: {
    marginBottom: 20, // Mantén un buen espacio entre secciones
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,  // Aumenta ligeramente el tamaño de texto para mejor legibilidad
    color: '#333',
  },
  instructionsInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Ajusta para un diseño más suave
    padding: 10, // Aumenta el padding para mayor confort de escritura
    height: 100, // Ajusta la altura del campo de instrucciones
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  modalSummaryContainer: {
    marginTop: 15,
    borderTopWidth: 1, // Añade una línea para separar el resumen
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20, // Aumenta el padding para darle más espacio y separar mejor del contenido
    paddingBottom: 10, // Espacio adicional para los botones
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#ff9900',
    padding: 18, // Aumenta el tamaño de los botones para hacerlos más cómodos
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18, // Aumenta el tamaño del texto para mayor legibilidad
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#cccccc',
    padding: 18, // Aumenta el tamaño de los botones para hacerlos más cómodos
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro translúcido para el modal
  },
  modalContent: {
    width: '90%',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  addressItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addressText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 18, // Aumenta el tamaño del texto para mayor legibilidad
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'column', // Cambiado para que los elementos estén en columna
    alignItems: 'flex-start', // Alineación a la izquierda
    backgroundColor: '#f2f2f2', // Fondo suave
    padding: 15, // Mayor padding para espaciamiento
    borderRadius: 15, // Borde redondeado
    marginVertical: 10, // Margen vertical
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  balanceText: {
    fontSize: 18, // Tamaño de fuente mayor para resaltar el balance
    fontWeight: 'bold', // Negrita para énfasis
    color: '#333', // Color de texto
    marginBottom: 10, // Espaciado debajo del texto
  },
  useBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Alinea el switch y el texto en los extremos
    width: '100%',
    paddingVertical: 5, // Pequeño padding vertical
  },
  useBalanceLabel: {
    fontSize: 16, // Tamaño de fuente más pequeño para contraste
    fontWeight: '600', // Peso medio para el texto
    color: '#666', // Color gris para un look más sutil
  },
  balanceSwitch: {
    transform: [{ scale: 1.1 }], // Aumenta ligeramente el tamaño del switch
    marginLeft: 'auto', // Alinea el switch al final
  },
  modalOrderTypeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalOrderTypeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
};

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#1c1c1c',
  },
  loaderContainer: {
    ...commonStyles.loaderContainer,
    backgroundColor: '#1c1c1c',
  },
  container: {
    ...commonStyles.container,
    backgroundColor: '#1c1c1c',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#fff',
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#333', // Fondo oscuro para el modo oscuro
  },
  balanceText: {
    ...commonStyles.balanceText,
    color: 'white', // Texto claro para contraste en modo oscuro
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
    color: '#fff',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#333',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    color: '#fff',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#444',
    color: '#fff',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#333',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    color: '#fff',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    color: '#fff',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#333',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    color: '#fff',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#444',
  },
  tipButtonSelected: {
    ...commonStyles.tipButtonSelected,
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    ...commonStyles.tipButtonText,
    color: '#fff',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#444',
    color: '#fff',
    borderColor: '#555',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#333',
  },
  summaryText: {
    ...commonStyles.summaryText,
    color: '#fff',
  },
  totalText: {
    ...commonStyles.totalText,
    color: '#fff',
  },
  savingsContainer: {
    ...commonStyles.savingsContainer,
    backgroundColor: '#444',
    borderColor: '#555',
  },
  savingsText: {
    ...commonStyles.savingsText,
    color: '#ffcc00',
  },
  adContainer: {
    ...commonStyles.adContainer,
    backgroundColor: '#333',
    borderColor: '#444',
  },
  adTitle: {
    ...commonStyles.adTitle,
    color: '#fff',
  },
  adText: {
    ...commonStyles.adText,
    color: '#fff',
  },
  orderTypeContainer: {
    ...commonStyles.orderTypeContainer,
    backgroundColor: '#333',
  },
  orderTypeText: {
    ...commonStyles.orderTypeText,
    color: '#fff',
  },
  largeModalContent: {
    ...commonStyles.largeModalContent,
    backgroundColor: '#333',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#fff',
  },
  modalText: {
    ...commonStyles.modalText,
    color: '#fff',
  },
  confirmButton: {
    ...commonStyles.confirmButton,
    backgroundColor: '#ff9900',
  },
  confirmButtonText: {
    ...commonStyles.confirmButtonText,
    color: '#fff',
  },
  cancelButton: {
    ...commonStyles.cancelButton,
    backgroundColor: '#555',
  },
  cancelButtonText: {
    ...commonStyles.cancelButtonText,
    color: '#fff',
  },
  modalOrderTypeContainer: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalOrderTypeText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#f9f9f9', // Fondo claro para el modo claro
  },
  balanceText: {
    ...commonStyles.balanceText,
    color: '#333', // Texto oscuro para contraste en modo claro
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
    color: '#666', // Color gris en modo claro
  },
  loaderContainer: {
    ...commonStyles.loaderContainer,
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: '#333',
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#fff',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    color: '#333',
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#fff',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    color: '#333',
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    color: '#333',
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#fff',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    color: '#333',
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#f2f2f2',
  },
  tipButtonSelected: {
    ...commonStyles.tipButtonSelected,
    backgroundColor: '#ff9900',
  },
  tipButtonText: {
    ...commonStyles.tipButtonText,
    color: '#333',
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#f9f9f9',
    color: '#333',
    borderColor: '#ccc',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#fff',
  },
  summaryText: {
    ...commonStyles.summaryText,
    color: '#333',
  },
  totalText: {
    ...commonStyles.totalText,
    color: '#333',
  },
  savingsContainer: {
    ...commonStyles.savingsContainer,
    backgroundColor: '#fffbec',
    borderColor: '#ffcc00',
  },
  savingsText: {
    ...commonStyles.savingsText,
    color: '#ff6600',
  },
  adContainer: {
    ...commonStyles.adContainer,
    backgroundColor: '#fff',
    borderColor: '#007bff',
  },
  adTitle: {
    ...commonStyles.adTitle,
    color: '#333',
  },
  adText: {
    ...commonStyles.adText,
    color: '#333',
  },
  orderTypeContainer: {
    ...commonStyles.orderTypeContainer,
    backgroundColor: '#fff',
  },
  orderTypeText: {
    ...commonStyles.orderTypeText,
    color: '#333',
  },
  largeModalContent: {
    ...commonStyles.largeModalContent,
    backgroundColor: '#fff',
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: '#333',
  },
  modalText: {
    ...commonStyles.modalText,
    color: '#333',
  },
  confirmButton: {
    ...commonStyles.confirmButton,
    backgroundColor: '#ff9900',
  },
  confirmButtonText: {
    ...commonStyles.confirmButtonText,
    color: '#1a1a1a',
  },
  cancelButton: {
    ...commonStyles.cancelButton,
    backgroundColor: '#cccccc',
  },
  cancelButtonText: {
    ...commonStyles.cancelButtonText,
    color: '#1a1a1a',
  },
  modalOrderTypeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalOrderTypeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export { stylesDark, stylesLight };
