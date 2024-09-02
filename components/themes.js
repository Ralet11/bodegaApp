import { StyleSheet } from 'react-native';

const lightTheme = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F2BB26',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 10,
  },
  iconButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 14,
  },
  addressToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 30
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginRight: 10,
    maxWidth: 150, // Ajustado maxWidth para que encaje en la pantalla
  },
  deliveryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#444',
    borderRadius: 15,
    padding: 3,
  },
  deliveryToggleButton: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginHorizontal: 3, // Agregado margen entre los botones de alternancia
  },
  deliveryToggleText: {
    fontSize: 14,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s',
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

  // Modal styles
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
    backgroundColor: '#fff',  // Fondo para modo claro
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
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 10,
  },
  iconButton: {
    marginHorizontal: 10,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    color: 'white',
    fontSize: 14,
  },
  addressToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    gap: 30
  },
  addressText: {
    fontSize: 14,
    color: '#fff',
    marginRight: 10,
    maxWidth: 150, // Ajustado maxWidth para que encaje en la pantalla
  },
  deliveryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#444',
    borderRadius: 15,
    padding: 3,
  },
  deliveryToggleButton: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginHorizontal: 3, // Agregado margen entre los botones de alternancia
  },
  deliveryToggleText: {
    fontSize: 14,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: '#000',
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
  },
  categoryImage: {
    width: 100,
    height: 60,
    borderRadius: 20,
    marginBottom: 5,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  offersContainer: {
    marginBottom: 20,
  },
  offerCard: {
    width: 160,
    backgroundColor: '#2e2e2e',
    borderRadius: 20,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s',
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
    color: '#fff',
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
    color: '#aaa',
  },
  shopContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#2e2e2e',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s',
  },
  shopImage: {
    width: '100%',
    height: 150,
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
    color: '#fff',
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
    color: '#fff',
    marginLeft: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },

  // Modal styles
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
    backgroundColor: '#333',  // Fondo para modo oscuro
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#fff',
  },
  addressItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  addressTextModal: {
    fontSize: 14,
    color: '#aaa',
  },
  separator: {
    height: 1,
    backgroundColor: '#555',
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

export { lightTheme, darkTheme };
