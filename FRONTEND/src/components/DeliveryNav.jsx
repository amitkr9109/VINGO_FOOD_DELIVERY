import axios from 'axios';
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const DeliveryNav = () => {

    const { userData, currentCity, cartItems } = useSelector(state => state.user);

    const [searchPanelOpen, setSearchPanelOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogout = async () => {

        const confirm = window.confirm("Are you sure you want to logout delivery boy?");
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


  return (
    <>
        <main className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[28%] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>

            <div className="flex items-center gap-5">
        
                <button onClick={() => navigate("/my-orders")} className='block font-thin bg-[#ff4d2d] text-white px-4 py-2 rounded-md md:text-sm text-xs cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]'>My Orders</button>
                <div className="profile-div">
                    <div onClick={() => setProfileOpen(prev => !prev)} className="w-[35px] h-[35px] bg-[#ff4d2d] text-white rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] uppercase">{userData?.fullName?.slice(0,1)}</div>
                    {profileOpen && (
                        <div className="fixed top-[80px] right-[10px] md:right-[29%] w-[180px] bg-white shadow-2xl rounded-md px-5 py-2 z-[9999] flex flex-col gap-1">
                            <h1 className='font-semibold capitalize'>{userData?.fullName}</h1>
                            <h4 className='font-medium'>Role :- {userData?.role}</h4>
                            <h2 onClick={handleLogout} className='logout font-medium cursor-pointer active:scale-95 text-[#ff4d2d]'>Log Out <i className="ri-logout-box-r-line"></i></h2>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </>
  )
}

export default DeliveryNav;