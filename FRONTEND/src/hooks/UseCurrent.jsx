import axios from 'axios';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const UseCurrent = () => {

  const { userData } = useSelector(state => state.user);

  useEffect(() => {

    const fetchUser = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/current`, { withCredentials: true });
        } catch (error) {
          return error;
        }
    }

    fetchUser();

  }, [userData]);
}

export default UseCurrent;
