import { StyleSheet } from 'react-native';


const lightTheme = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',  // Fondo blanco
  },
  header: {
    flexDirection: 'column',  // Cambiar a columna para que los elementos se apilen
    alignItems: 'flex-start',  // Alinear elementos a la izquierda
    justifyContent: 'flex-start',  // Evitar espacios entre ellos
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',  // Fondo blanco
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',  // Línea sutil en la parte inferior
  },
  addressToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // Asegura que la dirección y el botón de selección estén alineados
    width: '100%',  // Ocupar todo el ancho disponible
    marginBottom: 10,  // Espacio entre la dirección y la barra de búsqueda
  },
  addressText: {
    fontSize: 14,
    color: '#333',  // Color oscuro para mayor contraste
    maxWidth: 180,  // Limitar el ancho del texto
  },
  searchInput: {
    width: '90%',  // Hacer que ocupe todo el ancho disponible debajo de la dirección
    height: 40,
    borderColor: '#E0E0E0',  // Borde claro
    borderWidth: 1,
    borderRadius: 8,  // Bordes suavizados
    paddingHorizontal: 15,
    backgroundColor: '#F9F9F9',  // Fondo claro
    color: '#333',
    fontSize: 14,
  },
  deliveryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',  // Fondo claro para los botones de alternancia
    borderRadius: 12,  // Bordes más suaves
    padding: 3,
    marginTop: 10,  // Separación entre la barra de búsqueda y los botones de alternancia
  },
  deliveryToggleButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',  // Fondo blanco para botones no seleccionados
    borderWidth: 1,
    borderColor: '#E0E0E0',  // Bordes ligeros
  },
  deliveryToggleText: {
    fontSize: 14,
    color: '#333',  // Texto oscuro
  },
  contentContainer: {
    padding: 10,
    paddingBottom: 80,
    backgroundColor: '#FFFFFF',  // Fondo blanco puro para todo el contenido
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
    backgroundColor: '#FFFFFF',  // Fondo blanco puro para las categorías
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,  // Sombra ligera para dar profundidad
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
    backgroundColor: '#FFC300',  // Amarillo para el botón
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
    padding: 10,
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
    marginBottom: 15,
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
