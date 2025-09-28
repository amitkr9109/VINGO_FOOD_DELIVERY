import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

const UseGetItemsByCity = () => {
  
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);

    const userState = useSelector(state => state.user) || {};
    const { currentCity = null } = userState;


    useEffect(() => {

        if(!currentCity) {
            setLoading(true);
            return;
        }

        const fetchAllItems = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/items/get-by-city/${currentCity}`, { withCredentials: true });
                dispatch(setItemsInMyCity(response.data));
                localStorage.setItem("item", JSON.stringify(response.data));
            } catch (error) {
                return error;
            } finally {
                setLoading(false)
            }
        }

        fetchAllItems();

    }, [currentCity]);
}

export default UseGetItemsByCity

