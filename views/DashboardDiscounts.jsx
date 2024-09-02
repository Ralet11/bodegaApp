import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, useColorScheme, Animated, Easing, Dimensions } from 'react-native';
import Axios from 'react-native-axios';
import { API_URL } from '@env';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import DiscountShopCard from '../components/DiscountShopCard';
import { lightTheme, darkTheme } from '../components/themes';
import AccountDrawer from '../components/AccountDrawer';

const { width } = Dimensions.get('window');

const DashboardSkeletonLoader = () => {
    const colorScheme = useColorScheme();
    const shimmerAnimatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmerAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnimatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnimatedValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        );

        shimmerAnimation.start();
        return () => shimmerAnimation.stop();
    }, [shimmerAnimatedValue]);

    const translateX = shimmerAnimatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    const styles = colorScheme === 'dark' ? stylesDark : stylesLight;

    return (
        <View style={styles.container}>
            <View style={styles.loaderWrapper}>
                <View style={styles.header}>
                    <View style={styles.addressContainer}>
                        <View style={styles.addressText} />
                        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
                    </View>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInput} />
                        <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
                    </View>
                </View>
                <View style={styles.shopContainer}>
                    {[...Array(3)].map((_, index) => (
                        <View key={index} style={styles.shopItem}>
                            <View style={styles.shopImage} />
                            <View style={styles.shopDetails}>
                                <View style={styles.shopName} />
                                <View style={styles.discountText} />
                                <View style={styles.validityText} />
                                <View style={styles.orderButton} />
                            </View>
                            <Animated.View style={[styles.skeletonShimmer, { transform: [{ translateX }] }]} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

const DashboardDiscounts = () => {
    const token = useSelector(state => state?.user?.userInfo?.data?.token);
    const address = useSelector(state => state?.user?.address?.formatted_address);
    const [shopCatByDisc, setShopCatByDisc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigation = useNavigation();
    const scheme = useColorScheme();
    const user = useSelector((state) => state?.user?.userInfo?.data?.client);
    const auxShops = useSelector((state) => state?.setUp?.auxShops);

    useEffect(() => {
        const fetchShopsWithCatDiscount = async () => {
            console.log("actualizando discounts en dashdisc")
            try {
                const response = await Axios.get(`${API_URL}/api/local/app/getShopsOrderByCatDiscount`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setShopCatByDisc(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchShopsWithCatDiscount();
    }, [auxShops]);

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };

    const handleNavigate = (screen) => {
        setDrawerVisible(false);
        navigation.navigate(screen);
    };

    const handleSearchSubmit = () => {
        // Lógica de búsqueda
    };

    const handleShopPress = (shop) => {
        const orderTypeParam = 0;
        navigation.navigate('Shop', { shop, orderTypeParam });
    };

    const handleMapPress = () => {
        navigation.navigate("MapScreen");
    };

    return (
        <SafeAreaView style={scheme === 'dark' ? darkTheme.safeArea : lightTheme.safeArea}>
            {!shopCatByDisc ? (
                <DashboardSkeletonLoader />
            ) : (
                <>
                    <View style={scheme === 'dark' ? darkTheme.header : lightTheme.header}>
                        <View style={scheme === 'dark' ? darkTheme.addressToggleContainer : lightTheme.addressToggleContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('SetAddressScreen')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text
                                    style={scheme === 'dark' ? darkTheme.addressText : lightTheme.addressText}
                                    numberOfLines={1}
                                    ellipsizeMode='tail'
                                >
                                    {address}
                                </Text>
                                <FontAwesome name="caret-down" size={16} color={scheme === 'dark' ? '#fff' : '#333'} style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 }}>
                            <TouchableOpacity
                                onPress={toggleDrawer}
                                style={scheme === 'dark' ? darkTheme.iconButton : lightTheme.iconButton}
                            >
                                <FontAwesome name="bars" size={24} color={scheme === 'dark' ? 'white' : '#333'} />
                            </TouchableOpacity>
                            <TextInput
                                style={scheme === 'dark' ? darkTheme.searchInput : lightTheme.searchInput}
                                placeholder="Search discounts..."
                                placeholderTextColor="#aaa"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearchSubmit}
                            />
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={scheme === 'dark' ? darkTheme.contentContainer : lightTheme.contentContainer}>
                        {shopCatByDisc && shopCatByDisc[3]?.map(shop => (
                            <DiscountShopCard key={shop.id} shop={shop} scheme={scheme} handleShopPress={handleShopPress} />
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={mapButtonStyles.mapButton} onPress={handleMapPress}>
                        <FontAwesome name="map" size={24} color="#fff" />
                    </TouchableOpacity>
                </>
            )}
            <AccountDrawer
                visible={drawerVisible}
                onClose={toggleDrawer}
                onNavigate={handleNavigate}
                scheme={scheme}
                user={user}
            />
        </SafeAreaView>
    );
};

const commonStyles = {
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderWrapper: {
        width: '90%',
    },
    header: {
        marginBottom: 20,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        height: 30,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    addressText: {
        width: '80%',
        height: 20,
        borderRadius: 5,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderRadius: 10,
    },
    shopContainer: {
        marginBottom: 10,
    },
    shopItem: {
        flexDirection: 'row',
        borderRadius: 15,
        marginBottom: 10,
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        padding: 15,
    },
    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    shopDetails: {
        flex: 1,
        paddingHorizontal: 10,
    },
    shopName: {
        height: 16,
        borderRadius: 5,
        marginBottom: 10,
        width: '50%',
    },
    discountText: {
        height: 16,
        borderRadius: 5,
        marginBottom: 10,
        width: '30%',
    },
    validityText: {
        height: 16,
        borderRadius: 5,
        marginBottom: 10,
        width: '40%',
    },
    orderButton: {
        height: 30,
        borderRadius: 5,
        width: '50%',
        marginTop: 10,
    },
    skeletonShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
};

const stylesDark = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#1c1c1c',
    },
    loaderWrapper: {
        ...commonStyles.loaderWrapper,
    },
    addressContainer: {
        ...commonStyles.addressContainer,
        backgroundColor: '#333',
    },
    addressText: {
        ...commonStyles.addressText,
        backgroundColor: '#444',
    },
    searchContainer: {
        ...commonStyles.searchContainer,
        backgroundColor: '#333',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#444',
    },
    shopItem: {
        ...commonStyles.shopItem,
        backgroundColor: '#333',
    },
    shopImage: {
        ...commonStyles.shopImage,
        backgroundColor: '#444',
    },
    shopName: {
        ...commonStyles.shopName,
        backgroundColor: '#444',
    },
    discountText: {
        ...commonStyles.discountText,
        backgroundColor: '#444',
    },
    validityText: {
        ...commonStyles.validityText,
        backgroundColor: '#444',
    },
    orderButton: {
        ...commonStyles.orderButton,
        backgroundColor: '#444',
    },
});

const stylesLight = StyleSheet.create({
    ...commonStyles,
    container: {
        ...commonStyles.container,
        backgroundColor: '#f9f9f9',
    },
    loaderWrapper: {
        ...commonStyles.loaderWrapper,
    },
    addressContainer: {
        ...commonStyles.addressContainer,
        backgroundColor: '#e0e0e0',
    },
    addressText: {
        ...commonStyles.addressText,
        backgroundColor: '#d0d0d0',
    },
    searchContainer: {
        ...commonStyles.searchContainer,
        backgroundColor: '#e0e0e0',
    },
    searchInput: {
        ...commonStyles.searchInput,
        backgroundColor: '#d0d0d0',
    },
    shopItem: {
        ...commonStyles.shopItem,
        backgroundColor: '#e0e0e0',
    },
    shopImage: {
        ...commonStyles.shopImage,
        backgroundColor: '#d0d0d0',
    },
    shopName: {
        ...commonStyles.shopName,
        backgroundColor: '#d0d0d0',
    },
    discountText: {
        ...commonStyles.discountText,
        backgroundColor: '#d0d0d0',
    },
    validityText: {
        ...commonStyles.validityText,
        backgroundColor: '#d0d0d0',
    },
    orderButton: {
        ...commonStyles.orderButton,
        backgroundColor: '#d0d0d0',
    },
});

const mapButtonStyles = StyleSheet.create({
    mapButton: {
        position: 'absolute',
        top: 120,
        right: 20,
        backgroundColor: '#ff6347',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default DashboardDiscounts;