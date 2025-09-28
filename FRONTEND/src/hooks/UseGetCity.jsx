import React, { useEffect } from 'react'
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { setCity } from "../redux/userSlice"
import { setAddress, setLocation } from '../redux/mapSlice'

const UseGetCity = () => {

    const apikey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const dispatch = useDispatch();

    const userState = useSelector(state => state.user) || {};
    const { userData = null } = userState;


    useEffect(() => {
        navigator?.geolocation?.getCurrentPosition(async (position) => {
            const latitude = position?.coords?.latitude;
            const longitude = position?.coords?.longitude;

            dispatch(setLocation({ lat: latitude, lon: longitude }));
            localStorage.setItem("location", JSON.stringify({ lat: latitude, lon: longitude }));

            const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`);
            dispatch(setCity(response?.data?.results[0].city));
            dispatch(setAddress(response?.data?.results[0].formatted));
            localStorage.setItem("address", response?.data?.results[0].formatted);
        })
    }, [userData]);

}

export default UseGetCity;