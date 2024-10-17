import { StyleSheet } from 'react-native';

const lightTheme = StyleSheet.create({
  // Light theme styles remain unchanged
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addressToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    maxWidth: 180,
  },
  searchInput: {
    width: '90%',
    height: 40,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',
    color: '#333',
    fontSize: 14,
  },
  deliveryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 3,
    marginTop: 10,
  },
  deliveryToggleButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deliveryToggleText: {
    fontSize: 14,
    color: '#333',
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 80,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#ccc',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  category: {
    width: 100,
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryImage: {
    width: 100,
    height: 60,
    borderRadius: 20,
    marginBottom: 5,
  },
  categoryText: {
    color: '#333',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  offersContainer: {
    marginBottom: 20,
  },
  offerCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  offerImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
  },
  offerProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  offerPrice: {
    fontSize: 14,
    color: '#009929',
    marginBottom: 5,
  },
  offerShop: {
    fontSize: 12,
    color: '#777',
  },
  shopContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  shopImage: {
    width: '100%',
    height: 150,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 5,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#333',
    marginLeft: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  addressItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addressTextModal: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFC300',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

const darkTheme = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212', // Deep dark background
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Slightly lighter than the main background
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 10,
    paddingBottom: 15,
  },
  iconButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle light background
    color: '#E0E0E0',
    fontSize: 14,
  },
  addressToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: '100%',
  },
  addressText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginRight: 10,
    maxWidth: 200,
  },
  deliveryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle light background
    borderRadius: 20,
    padding: 4,
    marginTop: 10,
  },
  deliveryToggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  deliveryToggleText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 20,
    textAlign: 'left',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  category: {
    width: 100,
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle light background
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  offersContainer: {
    marginBottom: 20,
  },
  offerCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle light background
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  offerImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
  },
  offerProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  offerPrice: {
    fontSize: 14,
    color: '#4CAF50', // A more visible green for dark mode
    marginBottom: 5,
  },
  offerShop: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  shopContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle light background
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shopImage: {
    width: '100%',
    height: 160,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#B0B0B0',
    marginLeft: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  addressItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle light background
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addressTextModal: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle light separator
    width: '100%',
    marginVertical: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  addButton: {
    backgroundColor: '#FFC300',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  addButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { lightTheme, darkTheme };