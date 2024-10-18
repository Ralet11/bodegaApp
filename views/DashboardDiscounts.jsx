import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, useColorScheme, Modal, BackHandler, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { setAuxShops, setShopsDiscounts, setUserDiscounts } from '../redux/slices/setUp.slice';
import PromoSlider from '../components/PromotionSlider';
import AccountDrawer from '../components/AccountDrawer';
import { setAddress, setAddresses } from '../redux/slices/user.slice';
import SkeletonLoader from '../components/SkeletonLoader';
import { lightTheme } from '../components/themes';
import socketIOClient from "socket.io-client";
import DiscountShopScroll from '../components/DiscountShopScroll';

const DashboardDiscount = () => {
    const scheme = useColorScheme();
    const [shopsByCategory, setShopsByCategory] = useState({});
    const [filteredShopsByTags, setFilteredShopsByTags] = useState({});
    const [loading, setLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [deliveryMode, setDeliveryMode] = useState('orderIn');
    const categories = useSelector((state) => state?.setUp?.categories) || [];
    const address = useSelector((state) => state?.user?.address?.formatted_address);
    const addresses = useSelector((state) => state?.user?.addresses);
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const user = useSelector((state) => state?.user?.userInfo?.data?.client);
    const token = useSelector((state) => state?.user?.userInfo?.data?.token);
    const auxShops = useSelector((state) => state?.setUp?.auxShops);
    const [allTags, setAllTags] = useState([]);

    const orderTypeParam = deliveryMode === 'orderIn' ? 0 : deliveryMode === 'Pickup' ? 1 : null;

    // Extraer los tags únicos de los shops
    const extractTags = (shops) => {
        const tags = new Set();
        Object.keys(shops).forEach((categoryId) => {
            shops[categoryId].forEach((shop) => {
                if (shop.tags && Array.isArray(shop.tags)) {
                    shop.tags.forEach((tag) => tags.add(JSON.stringify(tag)));
                }
            });
        });
        const uniqueTagsArray = Array.from(tags).map(tag => JSON.parse(tag));
        setAllTags(uniqueTagsArray);
    };

    // Manejar la conexión de sockets para sincronizar shops
    useEffect(() => {
        const socket = socketIOClient(`${API_URL}`);

        const syncShops = () => {
            dispatch(setAuxShops());
        };

        socket.on('syncShops', syncShops);

        return () => {
            socket.off('syncShops');
            socket.disconnect();
        };
    }, [dispatch]);

    // Verificar el token y redirigir si no está disponible
    useEffect(() => {
        if (!token) {
            console.warn('Token not available');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    }, [token, navigation]);

    // Función para obtener los shops
    const fetchShops = async () => {
        if (!token) {
            console.warn('Token not available');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
            return;
        }
        try {
            const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCatDiscount`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShopsByCategory(response.data);
            extractTags(response.data);
            filterShopsByTags(response.data, deliveryMode);
            setLoading(false);
            dispatch(setShopsDiscounts(response.data));
        } catch (error) {
            console.error('Error fetching shops:', error);
            setLoading(false);
        }
    };

    // Función para obtener las direcciones del usuario
    const fetchAddress = async () => {
        if (!token) {
            console.warn('Token not available');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
            return;
        }

        try {
            const response = await Axios.get(`${API_URL}/api/addresses/getById`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                dispatch(setAddresses(response.data));
                if (!response.data || response.data.length === 0) {
                    setModalVisible(true);
                } else {
                    dispatch(setAddress(response.data[0]));
                    setModalVisible(false);
                }
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    // Obtener los descuentos del usuario
    useEffect(() => {
        if (user?.id && token) {
            const fetchUserDiscounts = async () => {
                try {
                    const response = await Axios.get(`${API_URL}/api/discounts/userDiscount/${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    dispatch(setUserDiscounts(response.data));
                } catch (error) {
                    console.error('Error fetching user discounts:', error);
                }
            };

            fetchUserDiscounts();
        }
    }, [user?.id, token, dispatch]);

    // Obtener shops y direcciones al montar el componente
    useEffect(() => {
        fetchShops();
        fetchAddress();
    }, [auxShops]);

    // Prevenir que el botón de back cierre la app
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );

    // Mostrar modal si no hay dirección seleccionada
    useFocusEffect(
        useCallback(() => {
            let timer;
            if (!address) {
                timer = setTimeout(() => {
                    setModalVisible(true);
                }, 2000);
            } else {
                setModalVisible(false);
            }
            return () => clearTimeout(timer);
        }, [address])
    );

    // Limpiar el campo de búsqueda al enfocar la pantalla
    useFocusEffect(
        useCallback(() => {
            setSearchQuery('');
        }, [])
    );

    const changeAddress = () => {
        setAddressModalVisible(true);
    };

    const handleAddressSelect = (selectedAddress) => {
        dispatch(setAddress(selectedAddress));
        setAddressModalVisible(false);
    };

    const handleShopPress = (shop) => {
        navigation.navigate('Shop', { shop, orderTypeParam });
    };

    const handleCategoryPress = (selectedTag) => {
        navigation.navigate('CategoryShops', { selectedTag, allTags });
    };

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };

    const handleNavigate = (screen) => {
        setDrawerVisible(false);
        navigation.navigate(screen);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            const filteredShops = [];

            Object.keys(filteredShopsByTags).forEach((tagName) => {
                const shops = filteredShopsByTags[tagName].filter((shop) =>
                    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (shops.length > 0) {
                    filteredShops.push(...shops);
                }
            });

            navigation.navigate('CategoryShops', { filteredShops, searchQuery, selectedTag: null, allTags });
        }
    };

    const handleToggle = (mode) => {
        setDeliveryMode(mode);
        filterShopsByTags(shopsByCategory, mode);
    };

    const filterShopsByTags = (shops, mode) => {
        const currentDateTime = new Date();
        const currentDay = currentDateTime.toLocaleString('en-US', { weekday: 'short' }).toLowerCase();
        const currentTime = currentDateTime.toTimeString().slice(0, 8);

        const filtered = {};
        Object.keys(shops).forEach((categoryId) => {
            shops[categoryId].forEach((shop) => {
                const isModeMatch = mode === 'orderIn' ? shop.orderIn : shop.pickUp;
                const isOpen = shop.openingHours.some((hour) => {
                    return (
                        hour.day === currentDay &&
                        hour.open_hour <= currentTime &&
                        hour.close_hour >= currentTime
                    );
                });

                if (isModeMatch && isOpen) {
                    shop.tags.forEach((tag) => {
                        if (!filtered[tag.name]) {
                            filtered[tag.name] = [];
                        }
                        filtered[tag.name].push(shop);
                    });
                }
            });
        });

        setFilteredShopsByTags(filtered);
    };

    const noShopsAvailable = !Object.keys(filteredShopsByTags).some(
        (tagName) => filteredShopsByTags[tagName].length > 0
    );

    if (loading) {
        return <SkeletonLoader />;
    }

    return (
        <SafeAreaView style={lightTheme.safeArea}>
            <View style={lightTheme.header}>
                <View style={lightTheme.addressToggleContainer}>
                    <TouchableOpacity onPress={changeAddress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <FontAwesome name="map-marker" size={20} color={'#333'} style={{ marginRight: 5 }} />
                        <Text
                            style={lightTheme.addressText}
                            numberOfLines={1}
                            ellipsizeMode='tail'
                        >
                            {address}
                        </Text>
                        <FontAwesome name="caret-down" size={16} color={'#333'} style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                    <View style={lightTheme.deliveryToggleContainer}>
                        <TouchableOpacity
                            style={[
                                lightTheme.deliveryToggleButton,
                                { backgroundColor: deliveryMode === 'orderIn' ? '#FFC300' : 'transparent' },
                            ]}
                            onPress={() => handleToggle('orderIn')}
                        >
                            <Text style={{ color: deliveryMode === 'orderIn' ? '#000' : '#fff' }}>Order In</Text>
                        </TouchableOpacity>
                        {/* Puedes agregar otros modos de entrega aquí */}
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
                    <TouchableOpacity
                        onPress={toggleDrawer}
                        style={lightTheme.iconButton}
                    >
                        <FontAwesome name="bars" size={24} color={'#333'} />
                    </TouchableOpacity>
                    <TextInput
                        style={lightTheme.searchInput}
                        placeholder="Search places, foods..."
                        placeholderTextColor="#aaa"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchSubmit}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={lightTheme.contentContainer}>
                <PromoSlider />
                <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#333' }}>
                        What are you looking for today?
                    </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {allTags.map((tag) => (
                        <TouchableOpacity
                            key={tag.id}
                            style={lightTheme.category}
                            onPress={() => handleCategoryPress(tag)}
                        >
                            <Image
                                source={{ uri: tag?.img || 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1628580001/placeholder.png' }}
                                style={lightTheme.categoryImage}
                            />
                            <Text style={lightTheme.categoryText}>
                                {tag.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {noShopsAvailable ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <Image
                            source={{ uri: 'https://res.cloudinary.com/doqyrz0sg/image/upload/v1720400961/c0e3cfe8-b839-496f-b6af-9e9f76d7360c_dev8hm.webp' }}
                            style={{ width: 200, height: 200 }}
                        />
                        <Text style={{ marginTop: 20, fontSize: 18, color: '#333' }}>
                            No shops available in your area
                        </Text>
                    </View>
                ) : (
                    Object.keys(filteredShopsByTags).map((name) => (
                        filteredShopsByTags[name].length > 0 && (
                            <DiscountShopScroll
                                key={name}
                                title={name}
                                items={filteredShopsByTags[name]}
                                scheme={scheme}
                                handleItemPress={handleShopPress}
                                allTags={allTags}
                            />
                        )
                    ))
                )}
            </ScrollView>

            <AccountDrawer
                visible={drawerVisible}
                onClose={toggleDrawer}
                onNavigate={handleNavigate}
                scheme={scheme}
                user={user}
            />

            {/* Modal para seleccionar dirección */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10, alignItems: 'center' }}>
                        <FontAwesome name="map-marker" size={50} color="#FFC107" />
                        <Text style={{ marginTop: 15, fontSize: 18, textAlign: 'center', color: '#333' }}>
                            You need to select an address to continue
                        </Text>
                        <TouchableOpacity
                            style={{ marginTop: 20, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#FFC300', borderRadius: 5 }}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('SetAddressScreen');
                            }}
                        >
                            <Text style={{ color: 'black' }}>Select Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal para cambiar dirección */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addressModalVisible}
                onRequestClose={() => {
                    setAddressModalVisible(!addressModalVisible);
                }}
            >
                <View style={lightTheme.modalBackground}>
                    <View style={lightTheme.modalContainer}>
                        <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={lightTheme.closeButton}>
                            <FontAwesome name="close" size={24} color={'#000'} />
                        </TouchableOpacity>
                        <Text style={lightTheme.modalTitle}>
                            Select Your Address
                        </Text>
                        <FlatList
                            data={addresses}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleAddressSelect(item)} style={lightTheme.addressItem}>
                                    <Text style={lightTheme.addressName}>
                                        {item.name}
                                    </Text>
                                    <Text style={lightTheme.addressTextModal}>
                                        {item.formatted_address}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={lightTheme.separator} />}
                            contentContainerStyle={lightTheme.flatListContent}
                        />
                        <TouchableOpacity
                            style={lightTheme.addButton}
                            onPress={() => {
                                setAddressModalVisible(false);
                                navigation.navigate('SetAddressScreen');
                            }}
                        >
                            <Text style={lightTheme.addButtonText}>+ Add Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default DashboardDiscount;
