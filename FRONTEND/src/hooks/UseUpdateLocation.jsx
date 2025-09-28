import axios from 'axios';
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

const UseUpdateLocation = () => {

    const userState = useSelector(state => state.user) || {};
    const { userData = null } = userState;

  
    useEffect(() => {
        const updateLocation = async (lat, lon) => {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/update-location`, {lat, lon}, { withCredentials: true });
        }

        navigator.geolocation.watchPosition((position) => {
            updateLocation(position.coords.latitude, position.coords.longitude);
        })
    }, [userData]);

}

export default UseUpdateLocation
