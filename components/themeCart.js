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
  goBackButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    marginTop: 20,
  },
  addressLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 10,
    marginTop: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
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
    width: 60,
    height: 60,
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
    fontSize: 7,
  },
  cartItemDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartItemPrice: {
    fontSize: 14,
    marginTop: 4,
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
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  tipContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tipButton: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
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
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'right',
  },
  checkoutButton: {
    backgroundColor: '#ff9900',
    paddingVertical: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  savingsContainer: {
    backgroundColor: '#fffbec',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ffcc00',
    borderWidth: 1,
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6600',
  },
  adContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  adText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#ff9900',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  signUpLink: {
    color: '#ff9900',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  button: {
    backgroundColor: "#FFC300",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowRadius: 20, 
    elevation: 15, 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10, 
  },
  balanceContainer: {
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
  balanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  useBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  useBalanceLabel: {
    fontSize: 16,
    fontWeight: '600',
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
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
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
  modalContent: {
    ...commonStyles.modalContent,
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
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#333',
  },
  balanceText: {
    ...commonStyles.balanceText,
    color: '#fff',
  },
  useBalanceContainer: {
    ...commonStyles.useBalanceContainer,
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
    color: '#fff',
  },
});

const stylesLight = StyleSheet.create({
  ...commonStyles,
  container: {
    ...commonStyles.container,
    backgroundColor: '#fff',
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
  closeButtonText: {
    paddingTop: 30
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
  modalContent: {
    ...commonStyles.modalContent,
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
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    ...commonStyles.cancelButtonText,
    color: '#1a1a1a',
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
  },
  balanceText: {
    ...commonStyles.balanceText,
  },
  useBalanceContainer: {
    ...commonStyles.useBalanceContainer,
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
  },
});

export { stylesDark, stylesLight };
