import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setSearchItems, socketRemoveCartItemDeleteByOwner } from '../redux/userSlice';

const UserNav = () => {

    const { userData, currentCity, cartItems, socket } = useSelector(state => state.user);

    const dispatch = useDispatch();

    const [searchPanelOpen, setSearchPanelOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [query, setQuery] = useState("");

    const navigate = useNavigate();

    const handleLogout = async () => {

        const confirm = window.confirm("Are you sure you want to logout user?");
        if (!confirm) return;

        try {
            await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            localStorage.removeItem("token");
            toast.success("User Logout successfull!");
            navigate("/");
        } catch (error) {
            throw error;
        }
    }

    const handleDelete = async () => {
        try {
            const confirm = window.confirm("Are you sure you want to permanently delete this account?");
            if (!confirm) return;
            const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/users/delete/${userData._id}`, { withCredentials: true });
            if(response.data) {
                toast.success("User account deleted permanently!");
                navigate("/");
            }
        } catch (error) {
           throw error;
        }
    }

    const handleSearchItemsInput = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/items/search-items?query=${query}&city=${currentCity}`, { withCredentials: true });
            const data = response.data;
            dispatch(setSearchItems(data));
            localStorage.setItem("searchitem", JSON.stringify(data));
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    }

    useEffect(() => {
        if(query) {
            handleSearchItemsInput();
        }
        else {
            dispatch(setSearchItems(null));
        }
    }, [query]);

    useEffect(() => {

        socket?.on("deleteItem", (itemId) => {
            dispatch(socketRemoveCartItemDeleteByOwner(itemId))
        });

        return () => {
            socket?.off("deleteItem");
        };
    }, [socket, dispatch]);


  return (
    <>
        <main className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>
            <div className="location-search-div md:w-[60%] lg:w-[40%] h-[60px] bg-white shadow-lg rounded-md md:flex items-center gap-5 hidden">
                <div className="location-div w-[30%] flex items-center gap-2 border-r-2 border-gray-500 px-4 overflow-hidden">
                    <i className="ri-map-pin-fill text-xl text-[#ff4d2d]"></i>
                    <div className="font-semibold w-[80%] truncate">{currentCity}</div>
                </div>
                <div className="search-div w-[80%] flex items-center">
                    <i className="ri-search-2-line text-[#ff4d2d] text-xl"></i>
                    <input
                        type="text" 
                        placeholder='Search delicious food...' 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className='px-2 outline-none w-full text-gray-500' 
                    />
                </div>
            </div>

            {searchPanelOpen && (
                <div className="location-search-div w-[90%] h-[60px] bg-white shadow-lg rounded-md flex items-center gap-2 fixed top-[70px] left-[5%] md:hidden">
                    <div className="location-div w-[35%] flex items-center gap-1 border-r-2 border-gray-500 px-4 overflow-hidden">
                        <i className="ri-map-pin-fill text-lg text-[#ff4d2d]"></i>
                        <div className="font-semibold w-[80%] truncate text-sm">Bhopal</div>
                    </div>
                    <div className="search-div w-[55%] flex items-center">
                        <i className="ri-search-2-line text-[#ff4d2d] text-xl"></i>
                        <input 
                            type="text"
                            placeholder='Search delicious food...'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className='px-2 outline-none w-full text-gray-500 text-sm' 
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-5">
                {searchPanelOpen ? <i onClick={() => setSearchPanelOpen(false)} className="ri-close-fill text-[#ff4d2d] text-2xl md:hidden"></i> : <i onClick={() => setSearchPanelOpen(true)} className="ri-search-2-line text-[#ff4d2d] text-xl md:hidden"></i>}
                
                <div onClick={() => navigate("/cart")} className="cart-div relative cursor-pointer active:scale-95 text-[#ff4d2d]">
                    <i className="ri-shopping-cart-fill text-2xl"></i>
                    <span className='absolute right-[-12px] top-[-7px]'>{cartItems.length}</span>
                </div>
                <button onClick={() => navigate("/my-orders")} className='hidden md:block font-thin bg-[#ff4d2d] text-white px-4 py-2 rounded-md text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]'>My Orders</button>
                <div className="profile-div">
                    <div onClick={() => setProfileOpen(prev => !prev)} className="w-[35px] h-[35px] bg-[#ff4d2d] text-white rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] uppercase">{userData.fullName.slice(0,1)}</div>
                    {profileOpen && (
                        <div className="fixed top-[80px] right-[10px] md:right-[20%] w-[180px] bg-white shadow-2xl rounded-md px-5 py-2 z-[9999] flex flex-col gap-1">
                            <h1 className='font-semibold capitalize'>{userData?.fullName}</h1>
                            <h4 className='font-medium'>Role :- {userData?.role}</h4>
                            <h2 onClick={() => navigate("/my-orders")} className='font-semibold cursor-pointer active:scale-95 text-blue-600 md:hidden'>My Orders</h2>
                            <h2 onClick={handleLogout} className='logout font-medium cursor-pointer active:scale-95 text-green-600'>Log Out <i className="ri-logout-box-r-line"></i></h2>
                            <h2 onClick={() => handleDelete()} className='logout font-medium cursor-pointer active:scale-95 text-[#ff4d2d]'>Delete <i className="ri-delete-bin-6-fill"></i></h2>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </>
  )
}

export default UserNav;