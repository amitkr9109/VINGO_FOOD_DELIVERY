import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { setShopInMyCity } from '../redux/userSlice'

const UseGetShopByCity = () => {
  
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);

    const userState = useSelector(state => state.user) || {};
    const { currentCity = null } = userState;


    useEffect(() => {

        if(!currentCity) {
            setLoading(true);
            return;
        }

        const fetchAllShops = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/shops/get-by-city/${currentCity}`, { withCredentials: true });
                dispatch(setShopInMyCity(response.data));
                localStorage.setItem("shop", JSON.stringify(response.data));
            } catch (error) {
                return error;
            } finally {
                setLoading(false)
            }
        }

        fetchAllShops();

    }, [currentCity]);
}

export default UseGetShopByCity
