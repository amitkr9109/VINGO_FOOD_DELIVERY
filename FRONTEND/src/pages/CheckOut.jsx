import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import axios from 'axios';

import { TbCurrentLocation } from "react-icons/tb";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobile } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa6";
import { toast } from 'react-toastify';
import { addMyOrder } from '../redux/userSlice';


const CheckOut = () => {

    const { location, address } = useSelector(state => state.map);
    const userState = useSelector(state => state.user) || {};
    const { cartItems = [], userData = null, totalAmount = 0 } = userState;

    const navigate = useNavigate("");
    const dispatch = useDispatch();

    const [addressInput, setAddressInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const deliveryFee = totalAmount > 500 ? 0 : "₹ 40";
    const amountWithDeliveryFee = totalAmount + (totalAmount > 500 ? 0 : 40);


    function RecenterMap({ location }) {
        if(location?.lat && location?.lon) {
            const map = useMap();
            map.setView([ location.lat, location.lon ], 16, { animate: true })
        }
        return null
    }

    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat, lon: lng }));
        getAddressByLatLng(lat, lng);
    }

    const getAddressByLatLng = async (lat, lng) => {
        try {
            const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apikey}`);
            const formattedAddress = response.data.results[0]?.formatted;
            dispatch(setAddress(formattedAddress));
            return formattedAddress;
        } catch (error) {
            return error;
        }
    }

    const getCurrentLocation = () => {
        const latitude = userData?.location?.coordinates[1];
        const longitude = userData?.location?.coordinates[0];

        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
    }

    const getLatLngByAddress = async () => {
        try {
           const response = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apikey}`);
           const { lat, lon } = response.data.features[0]?.properties || {};
           dispatch(setLocation({ lat, lon }));
        } catch (error) {
            return error;
        }
    }


    const handlePlaceOrder = async () => {

        const newData = {
            paymentMethod,
            deliveryAddress: {
               text: addressInput,
               latitude: location.lat,
               longitude: location.lon, 
            },
            totalAmount: amountWithDeliveryFee,
            cartItems
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/orders/place-order`, newData, {withCredentials: true});
            const data = response.data;

            if(paymentMethod === "cod") {
                dispatch(addMyOrder(data));
                localStorage.setItem("order", JSON.stringify(data));
                toast.success("Order placed successfully");
                navigate("/order-placed");
            }
            else{
                const orderId = response.data.orderId
                const razorOrder = response.data.razorOrder 
                openRazorpayWindow(orderId, razorOrder)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Order placed failed");
        }
    }

    const openRazorpayWindow = (orderId, razorOrder) => {

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: razorOrder.amount,
            currency: "INR",
            name: "Vingo",
            description: "Food Delivery Website",
            order_id: razorOrder.id,
            handler: async function (result) {
                try {
                    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/orders/verify-payment`, {
                        razorpay_payment_id: result.razorpay_payment_id,
                        orderId
                    }, { withCredentials: true });
                    const data = response.data;

                    dispatch(addMyOrder(data));
                    localStorage.setItem("order", JSON.stringify(data));
                    toast.success("Order placed successfully");
                    navigate("/order-placed");

                } catch (error) {
                    toast.error(error.response?.data?.message || "Order placed failed");
                }
            },
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
    }

    useEffect(() => {
        setAddressInput(address)
    }, [address]);

  return (
    <>
        <main className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-5'>
            <div className="back-div absolute top-[20px] left-[20px]">
                <i onClick={() => navigate("/cart")} className="ri-arrow-left-long-line cursor-pointer active:scale-95 text-[#ff4d2d] text-lg"></i>
            </div>
            <div className="heading-div w-full max-w-[900px] bg-white rounded-md p-6 space-y-5">
                <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>

                <section className='location-section'>
                    <h2 className='text-lg font-semibold flex items-center gap-2 text-gray-800 capitalize mb-2'><i className="ri-map-pin-fill text-[#ff4d2d]"></i> delivery location</h2>
                    <div className="flex gap-2 mb-3">
                        <input 
                            type="text" 
                            placeholder='enter your delivery address' 
                            value={addressInput}
                            onChange={(e) => setAddressInput(e.target.value)}
                            className='capitalize flex-1 border border-gray-300 rounded-md p-2 md:text-sm text-xs truncate focus:outline-none focus:ring-1 focus:ring-[#ff4d2d]'
                        />
                        <button onClick={getLatLngByAddress} className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-3 py-2 rounded-md flex items-center justify-center transition cursor-pointer active:scale-95'><i className="ri-search-2-line"></i></button>
                        <button onClick={getCurrentLocation} className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center justify-center transition cursor-pointer active:scale-95'><TbCurrentLocation /></button>
                    </div>
                    <div className="map-image-div border rounded-md overflow-hidden">
                        <div className="w-full md:h-80 h-64 flex items-center justify-center">
                          <MapContainer className='w-full h-full' center={[location?.lat, location?.lon]} zoom={16}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <RecenterMap location={location} />
                            <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />
                          </MapContainer>
                        </div>
                    </div>
                </section>

                <section className='payment-section'>
                    <h1 className='font-semibold text-xl mb-3'>Payment Method</h1>
                    <div className="cash-online-payment-div grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div onClick={() => setPaymentMethod("cod")} className={`cash-payment-div flex items-center gap-2 rounded-md p-4 border text-left active:scale-95 cursor-pointer ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:bg-gray-300"}`}>
                            <span className='h-10 w-10 inline-flex items-center justify-center rounded-full bg-green-100'>
                                <MdDeliveryDining className='text-green-600 text-xl' />
                            </span>
                            <div className="paragraph-div">
                                <p className='font-medium text-gray-800'>Cash On Delivery</p>
                                <p className='text-xs text-gray-500'>Pay when your food arrives</p>
                            </div>
                        </div>
                        <div onClick={() => setPaymentMethod("online")} className={`online-payment-div flex items-center gap-2 rounded-md p-4 border text-left active:scale-95 cursor-pointer ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:bg-gray-300"}`}>
                            <span className='h-10 w-10 inline-flex items-center justify-center rounded-full bg-purple-100'>
                                <FaMobile className='text-purple-700 tetx-xl' />
                            </span>
                            <span className='h-10 w-10 inline-flex items-center justify-center rounded-full bg-blue-100'>
                                <FaCreditCard className='text-blue-700 tetx-xl' />
                            </span>
                            <div className="paragraph-div">
                                <p className='font-medium text-gray-800 md:text-lg text-xs'>UPI / Credit / Debit Card</p>
                                <p className='text-xs text-gray-500'>Pay Securely Online</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='order-details-section'>
                    <h2 className='font-semibold text-lg text-gray-800 mb-2'>Order Summary</h2>
                    <div className="p-4 border bg-gray-50 space-y-2 rounded-md">
                        {cartItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-gray-700">
                                <span className='capitalize'>{item?.name} <span className='lowercase'>x</span> {item?.quantity}</span>
                                <span>₹ {item?.price * item?.quantity}</span>
                            </div>
                        ))}
                        <hr className='border-gray-400 my-2' />
                        <div className="flex items-center justify-between text-gray-800 font-medium">
                            <span>Total Amount</span>
                            <span>₹ {totalAmount}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-700">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? "Free" : deliveryFee}</span>
                        </div>
                        <hr className='border-gray-300 my-2' />
                        <div className="flex items-center justify-between font-bold md:text-lg text-xs text-[#ff4d2d] pt-2">
                            <span>Total Amount with delivery</span>
                            <span>₹ {amountWithDeliveryFee}</span>
                        </div>
                    </div>
                    <button onClick={handlePlaceOrder} className='w-full bg-[#ff4d2d] text-white py-2 rounded-md hover:bg-[#e64526] transition cursor-pointer active:scale-95 mt-5'>
                        {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
                    </button>
                </section>
            </div>
        </main>
    </>
  )
}

export default CheckOut;
