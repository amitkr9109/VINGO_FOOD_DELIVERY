import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice'

const UseGetMyShop = () => {

    const userState = useSelector(state => state.user) || {};
    const { userData = null } = userState;


    const dispatch = useDispatch();
  
    useEffect(() => {
        const fetchShop = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/shops/get-my`, { withCredentials: true });
                dispatch(setMyShopData(response.data));
            } catch (error) {
                return error;
            }
        }
        fetchShop();
    }, [userData]);

}

export default UseGetMyShop;
