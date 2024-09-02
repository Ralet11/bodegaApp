import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import Axios from 'react-native-axios';
import { FontAwesome } from '@expo/vector-icons';

const DiscountShopCard = ({ shop, handleShopPress }) => {
    const userAddress = useSelector((state) => state?.user?.address?.formatted_address);
    const [distance, setDistance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const scheme = useColorScheme(); // Detectar el esquema de color

    const GOOGLE_MAPS_API_KEY = 'AIzaSyAvritMA-llcdIPnOpudxQ4aZ1b5WsHHUc';

    useEffect(() => {
        const fetchDistance = async () => {
            if (userAddress && shop.address) {
                try {
                    const response = await Axios.get(
                        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(userAddress)}&destinations=${encodeURIComponent(shop.address)}&key=${GOOGLE_MAPS_API_KEY}`
                    );
                    const distanceText = response.data.rows[0].elements[0].distance.text;
                    setDistance(distanceText);
                } catch (error) {
                    console.error('Error fetching distance:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchDistance();
    }, [userAddress, shop.address]);

    // Estilos dinámicos basados en el esquema de color
    const dynamicStyles = scheme === 'dark' ? stylesDark : stylesLight;

    return (
        <View style={dynamicStyles.shopContainer}>
            <View style={dynamicStyles.shopHeader}>
                <Image source={{ uri: shop.img }} style={dynamicStyles.shopImage} />
            </View>
            <View style={dynamicStyles.shopContent}>
                <Text style={dynamicStyles.shopTitle}>{shop.name}</Text>
                {shop.discounts.length > 1 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamicStyles.discountsContainer}>
                        {shop.discounts
                            .filter(discount => discount.delivery === 0)
                            .map((discount, index) => (
                                <View key={index} style={dynamicStyles.discountCard}>
                                    {discount.img && (
                                        <Image 
                                            source={{ uri: discount.img }} 
                                            style={dynamicStyles.discountImage} 
                                        />
                                    )}
                                    <Text style={dynamicStyles.productName}>{discount.productName}</Text>
                                    <Text style={dynamicStyles.discountType}>{discount.discountType === 'percentage' ? `${discount.percentage}% off` : `Flat ${discount.fixedValue}`}</Text>
                                    <Text style={dynamicStyles.limitDate}>Valid until: {new Date(discount.limitDate).toLocaleDateString()}</Text>
                                    <Text style={dynamicStyles.orderInTag}>Order In</Text>
                                </View>
                            ))}
                    </ScrollView>
                ) : (
                    <View style={dynamicStyles.singleDiscountContainer}>
                        {shop.discounts
                            .filter(discount => discount.delivery === 2)
                            .map((discount, index) => (
                                <View key={index} style={dynamicStyles.singleDiscountCard}>
                                    {discount.image && (
                                        <Image 
                                            source={{ uri: `https://res.cloudinary.com/doqyrz0sg/image/upload/v1722030215/shop/${discount.image}` }} 
                                            style={dynamicStyles.singleDiscountImage} 
                                        />
                                    )}
                                    <Text style={dynamicStyles.productName}>{discount.productName}</Text>
                                    <Text style={dynamicStyles.discountType}>{discount.discountType === 'percentage' ? `${discount.percentage}% off` : `Flat ${discount.fixedValue}`}</Text>
                                    <Text style={dynamicStyles.limitDate}>Valid until: {new Date(discount.limitDate).toLocaleDateString()}</Text>
                                    <Text style={dynamicStyles.orderInTag}>Order In</Text>
                                </View>
                            ))}
                    </View>
                )}
                <View style={dynamicStyles.shopDetails}>
                    <View style={dynamicStyles.addressContainer}>
                        <FontAwesome name="map-marker" size={18} color={scheme === 'dark' ? '#FFD700' : '#ff6347'} />
                        <Text style={dynamicStyles.shopAddress}>{shop.address}</Text>
                    </View>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={scheme === 'dark' ? '#fff' : '#000'} />
                    ) : (
                        distance && <Text style={dynamicStyles.shopDistance}>{distance} away</Text>
                    )}
                    <TouchableOpacity onPress={() => handleShopPress(shop)} style={dynamicStyles.shopButton}>
                        <Text style={dynamicStyles.shopButtonText}>Go to Shop</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const stylesDark = StyleSheet.create({
    shopContainer: {
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        overflow: 'hidden',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 3,
    },
    shopHeader: {
        height: 150,
        backgroundColor: '#2b2b2b',
    },
    shopImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    shopContent: {
        padding: 20,
    },
    shopTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#E5E5E5',
        marginBottom: 15,
    },
    discountsContainer: {
        flexDirection: 'row',
    },
    discountCard: {
        backgroundColor: '#2b2b2b',
        padding: 10,
        borderRadius: 10,
        width: 150,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    singleDiscountContainer: {
        alignItems: 'center',
    },
    singleDiscountCard: {
        backgroundColor: '#2b2b2b',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    discountImage: {
        width: '100%',
        height: 70,
        borderRadius: 8,
        marginBottom: 8,
    },
    singleDiscountImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 4,
    },
    discountType: {
        fontSize: 13,
        color: '#E0E0E0',
        marginVertical: 2,
        textAlign: 'center',
    },
    limitDate: {
        fontSize: 12,
        color: '#B0BEC5',
        marginTop: 5,
        textAlign: 'center',
    },
    orderInTag: {
        backgroundColor: '#444',
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 5,
        textAlign: 'center',
        marginTop: 8,
    },
    shopDetails: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 15,
        flexDirection: 'column',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    shopAddress: {
        fontSize: 14,
        color: '#B0BEC5',
        marginLeft: 8,
    },
    shopDistance: {
        fontSize: 14,
        color: '#B0BEC5',
        textAlign: 'right',
    },
    shopButton: {
        marginTop: 10,
        backgroundColor: '#FFD700',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    shopButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

const stylesLight = StyleSheet.create({
    shopContainer: {
        backgroundColor: '#fdfdfd',
        borderRadius: 15,
        overflow: 'hidden',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    shopHeader: {
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    shopImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    shopContent: {
        padding: 20,
    },
    shopTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    discountsContainer: {
        flexDirection: 'row',
    },
    discountCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        width: 150,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    singleDiscountContainer: {
        alignItems: 'center',
    },
    singleDiscountCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    discountImage: {
        width: '100%',
        height: 70,
        borderRadius: 8,
        marginBottom: 8,
    },
    singleDiscountImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
        marginBottom: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    discountType: {
        fontSize: 13,
        color: '#888',
        marginVertical: 2,
        textAlign: 'center',
    },
    limitDate: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 5,
        textAlign: 'center',
    },
    orderInTag: {
        backgroundColor: '#FFF59D',
        color: '#F57F17',
        fontSize: 12,
        fontWeight: 'bold',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 5,
        textAlign: 'center',
        marginTop: 8,
    },
    shopDetails: {
        marginTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 15,
        flexDirection: 'column',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    shopAddress: {
        fontSize: 14,
        color: '#777',
        marginLeft: 8,
    },
    shopDistance: {
        fontSize: 14,
        color: '#999',
        textAlign: 'right',
    },
    shopButton: {
        marginTop: 10,
        backgroundColor: '#FFD700',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    shopButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default DiscountShopCard;