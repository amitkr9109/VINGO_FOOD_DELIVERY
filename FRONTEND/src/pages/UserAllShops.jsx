import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import ItemCard from '../components/ItemCard';

import { FaStore } from "react-icons/fa";
import { FaUtensils } from "react-icons/fa";


const UserAllShops = () => {

    const {id} = useParams();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [shop, setShop] = useState([]);

    const handleShopView = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/items/get-shops/${id}`, { withCredentials: true });
            setShop(response.data.shop);
            setItems(response.data.items);
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    useEffect(() => {
        handleShopView();
    }, [id]);

  return (
    <>
      <main className='min-h-screen bg-gray-100'>
        <button onClick={() => navigate("/home")} className='absolute top-4 left-4 z-1 bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer active:scale-95 hover:bg-gray-500 transition-all'><i className="ri-arrow-left-long-line"></i> <span>Back</span></button>
        {shop && <div className='shop-details-div relative w-full md:h-[70vh] h-64'>
            <img src={shop?.image} alt="" className='w-full h-full object-cover'/>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col items-center justify-center text-center px-5">
                <FaStore className='text-white text-4xl drop-shadow-md mb-2'/>
                <h1 className='capitalize md:text-5xl text-3xl text-white font-extrabold'>{shop?.name}</h1>
                <p className='text-lg font-medium text-white mt-2'><span className='font-medium'><i className="ri-map-pin-2-fill"></i></span> {shop?.address}, ({shop?.city})</p>
            </div>
        </div>}
        <div className="max-w-7xl mx-auto px-5 py-10">
            <h2 className='flex items-center justify-center gap-3 text-3xl font-bold text-gray-800 mb-10'>
                <FaUtensils color='red' /> Our Menu
            </h2>

            {items?.length > 0 ? (
                <div className='flex flex-wrap justify-center gap-5'>
                    {items?.map((item, idx) => (
                        <ItemCard key={idx} data={item} />
                    ))}
                </div>
            ) : (<p className='text-center text-gray-600 text-lg'>Sorry, no items available in this shop 😂😂</p>)}
        </div>
      </main>
    </>
  )
}

export default UserAllShops;
