// themeCart.js

import { StyleSheet } from 'react-native';

const colors = {
  primary: '#ff9900',
  secondary: '#ffcc00',
  backgroundLight: '#ffffff',
  backgroundDark: '#1c1c1c',
  textLight: '#ffffff',
  textDark: '#333333',
  accent: '#ff9900',
  borderColor: '#e0e0e0',
  placeholderTextLight: '#888888',
  placeholderTextDark: '#cccccc',
  shadowColor: '#000',
  success: '#28a745',
  danger: '#dc3545',
  warning: '#ffcc00',
  cardBackground: '#f9f9f9',
  modalBackground: '#f0f0f0',
};

const fontSizes = {
  xs: 12,
  small: 14,
  medium: 16,
  large: 18,
  xLarge: 22,
  xxLarge: 26,
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const fonts = {
  regular: 'System',
  bold: 'System',
};

const shadowStyle = {
  shadowColor: colors.shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

const commonStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.xxl + 20,
  },
  goBackButton: {
    marginRight: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.xxLarge,
    fontWeight: '700',
    color: colors.textDark,
  },
  orderTypeContainer: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: colors.cardBackground,
    ...shadowStyle,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  orderTypeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  orderTypeOptionText: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.textDark,
  },
  addressContainer: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: spacing.md,
    backgroundColor: colors.cardBackground,
    ...shadowStyle,
  },
  addressLabel: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    flex: 1,
    fontSize: fontSizes.medium,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundLight,
    color: colors.textDark,
  },
  cartItemsContainer: {
    marginBottom: spacing.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  quantityTextContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  tipContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadowStyle,
  },
  tipLabel: {
    fontSize: fontSizes.large,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textDark,
  },
  tipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipButton: {
    backgroundColor: colors.backgroundLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderColor,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  tipButtonSelected: {
    backgroundColor: colors.primary,
  },
  tipButtonText: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.textDark,
  },
  customTipInput: {
    marginTop: spacing.sm,
    fontSize: fontSizes.medium,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundLight,
    color: colors.textDark,
  },
  summaryContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadowStyle,
  },
  summaryText: {
    fontSize: fontSizes.large,
    marginBottom: spacing.sm,
    color: colors.textDark,
  },
  totalText: {
    fontSize: fontSizes.xLarge,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  checkoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadowStyle,
  },
  checkoutButtonText: {
    color: colors.textLight,
    fontSize: fontSizes.xLarge,
    fontWeight: 'bold',
  },
  savingsContainer: {
    backgroundColor: colors.warning,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.secondary,
    borderWidth: 1,
  },
  savingsText: {
    fontSize: fontSizes.large,
    fontWeight: '700',
    color: colors.textDark,
  },
  adContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent,
    borderWidth: 1,
    ...shadowStyle,
  },
  adTitle: {
    fontSize: fontSizes.xLarge,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textDark,
  },
  adText: {
    fontSize: fontSizes.medium,
    color: colors.textDark,
  },
  balanceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBackground,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginVertical: spacing.md,
    ...shadowStyle,
  },
  balanceText: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  useBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.xs,
  },
  useBalanceLabel: {
    fontSize: fontSizes.medium,
    fontWeight: '600',
    color: colors.textDark,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  largeModalContent: {
    backgroundColor: colors.modalBackground,
    borderRadius: spacing.md,
    padding: spacing.lg,
    width: '95%',
    height: '95%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    ...shadowStyle,
  },
  modalTitle: {
    fontSize: fontSizes.xLarge,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.textDark,
  },
  modalScrollView: {
    flex: 1,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.textDark,
  },
  modalText: {
    fontSize: fontSizes.medium,
    color: colors.textDark,
  },
  instructionsInput: {
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: colors.backgroundLight,
    color: colors.textDark,
  },
  modalSummaryContainer: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderColor,
    paddingTop: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  confirmButtonText: {
    color: colors.textLight,
    fontSize: fontSizes.large,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.borderColor,
    padding: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: colors.textDark,
    fontSize: fontSizes.large,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: fontSizes.large,
    fontWeight: 'bold',
    color: colors.primary,
  },
  discountLabel: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
  discountLabelText: {
    color: colors.textDark,
    fontWeight: 'bold',
    fontSize: fontSizes.xs,
  },
  promotionLabel: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#82ccdd',
    padding: spacing.xs,
    borderRadius: spacing.xs,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: colors.borderColor,
  },
  freeText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  modalOrderTypeContainer: {
    backgroundColor: colors.cardBackground,
    padding: spacing.lg,
    borderRadius: spacing.md,
    ...shadowStyle,
  },
  modalOrderTypeText: {
    fontSize: fontSizes.large,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    paddingBottom: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSizes.medium,
    color: colors.textDark,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.small,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: fontSizes.large,
    fontWeight: 'bold',
  },
  footerLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  footerText: {
    color: colors.accent,
    fontSize: fontSizes.medium,
  },
};

const stylesLight = StyleSheet.create({
  ...commonStyles,
});

const stylesDark = StyleSheet.create({
  ...commonStyles,
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: colors.backgroundDark,
  },
  container: {
    ...commonStyles.container,
    backgroundColor: colors.backgroundDark,
  },
  headerTitle: {
    ...commonStyles.headerTitle,
    color: colors.textLight,
  },
  orderTypeContainer: {
    ...commonStyles.orderTypeContainer,
    backgroundColor: '#2c2c2e',
  },
  orderTypeOption: {
    ...commonStyles.orderTypeOption,
    backgroundColor: '#3a3a3c',
    borderColor: '#48484a',
  },
  orderTypeOptionText: {
    ...commonStyles.orderTypeOptionText,
    color: colors.textLight,
  },
  addressContainer: {
    ...commonStyles.addressContainer,
    backgroundColor: '#2c2c2e',
  },
  addressLabel: {
    ...commonStyles.addressLabel,
    color: colors.textLight,
  },
  addressInput: {
    ...commonStyles.addressInput,
    backgroundColor: '#3a3a3c',
    color: colors.textLight,
    borderColor: '#48484a',
  },
  cartItem: {
    ...commonStyles.cartItem,
    backgroundColor: '#2c2c2e',
  },
  cartItemName: {
    ...commonStyles.cartItemName,
    color: colors.textLight,
  },
  cartItemPrice: {
    ...commonStyles.cartItemPrice,
    color: colors.primary,
  },
  quantityButton: {
    ...commonStyles.quantityButton,
    backgroundColor: colors.primary,
  },
  quantityButtonText: {
    ...commonStyles.quantityButtonText,
    color: colors.textLight,
  },
  quantityText: {
    ...commonStyles.quantityText,
    color: colors.textLight,
  },
  tipContainer: {
    ...commonStyles.tipContainer,
    backgroundColor: '#2c2c2e',
  },
  tipLabel: {
    ...commonStyles.tipLabel,
    color: colors.textLight,
  },
  tipButton: {
    ...commonStyles.tipButton,
    backgroundColor: '#3a3a3c',
    borderColor: '#48484a',
  },
  tipButtonText: {
    ...commonStyles.tipButtonText,
    color: colors.textLight,
  },
  customTipInput: {
    ...commonStyles.customTipInput,
    backgroundColor: '#3a3a3c',
    color: colors.textLight,
    borderColor: '#48484a',
  },
  summaryContainer: {
    ...commonStyles.summaryContainer,
    backgroundColor: '#2c2c2e',
  },
  summaryText: {
    ...commonStyles.summaryText,
    color: colors.textLight,
  },
  totalText: {
    ...commonStyles.totalText,
    color: colors.textLight,
  },
  checkoutButton: {
    ...commonStyles.checkoutButton,
    backgroundColor: colors.accent,
  },
  checkoutButtonText: {
    ...commonStyles.checkoutButtonText,
    color: colors.textLight,
  },
  savingsContainer: {
    ...commonStyles.savingsContainer,
    backgroundColor: '#3a3a3c',
  },
  savingsText: {
    ...commonStyles.savingsText,
    color: colors.warning,
  },
  adContainer: {
    ...commonStyles.adContainer,
    backgroundColor: '#2c2c2e',
  },
  adTitle: {
    ...commonStyles.adTitle,
    color: colors.textLight,
  },
  adText: {
    ...commonStyles.adText,
    color: colors.textLight,
  },
  balanceContainer: {
    ...commonStyles.balanceContainer,
    backgroundColor: '#2c2c2e',
  },
  balanceText: {
    ...commonStyles.balanceText,
    color: colors.textLight,
  },
  useBalanceLabel: {
    ...commonStyles.useBalanceLabel,
    color: colors.textLight,
  },
  modalTitle: {
    ...commonStyles.modalTitle,
    color: colors.textLight,
  },
  modalText: {
    ...commonStyles.modalText,
    color: colors.textLight,
  },
  confirmButtonText: {
    ...commonStyles.confirmButtonText,
    color: colors.textLight,
  },
  cancelButtonText: {
    ...commonStyles.cancelButtonText,
    color: colors.textLight,
  },
  closeButtonText: {
    ...commonStyles.closeButtonText,
    color: colors.primary,
  },
  discountLabelText: {
    ...commonStyles.discountLabelText,
    color: colors.textLight,
  },
  strikethrough: {
    ...commonStyles.strikethrough,
    color: '#888888',
  },
  freeText: {
    ...commonStyles.freeText,
    color: colors.success,
  },
  input: {
    ...commonStyles.input,
    color: colors.textLight,
  },
  errorText: {
    ...commonStyles.errorText,
    color: colors.danger,
  },
});

export { stylesDark, stylesLight };
