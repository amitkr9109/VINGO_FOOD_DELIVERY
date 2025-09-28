import axios from 'axios';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setMyOrders } from '../redux/userSlice';

const UseGetMyOrders = () => {

    const userState = useSelector(state => state.user) || {};
    const { userData = null } = userState;


    const dispatch = useDispatch();

    useEffect(() => {

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/my-orders`, { withCredentials: true });
                dispatch(setMyOrders(response.data));
            } catch (error) {
                return error;
            }
        }

        fetchOrders();

    }, [userData]);
}

export default UseGetMyOrders
