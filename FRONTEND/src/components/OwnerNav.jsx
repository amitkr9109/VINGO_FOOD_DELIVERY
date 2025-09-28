import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const OwnerNav = () => {

    const userState = useSelector(state => state.user) || {};
    const { userData = null } = userState;

    const ownerState = useSelector(state => state.owner) || {};
    const { myShopData = [] } = ownerState;


    const [profileOpen, setProfileOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogout = async () => {

        const confirm = window.confirm("Are you sure you want to logout owner?");
        if (!confirm) return;

        try {
            await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            localStorage.removeItem("token");
            toast.success("Owner Logout successfull!");
            navigate("/");
        } catch (error) {
            throw error;
        }
    }


  return (
    <>
        <main className='w-full h-[80px] flex items-center justify-between md:justify-center md:gap-32 px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible'>
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>
            <div className="flex items-center gap-4">
                {myShopData && (
                    <div className="add-item-button">
                        <button onClick={() => navigate("/create-shop")} className="hidden md:flex items-center text-center gap-2 bg-[#ff4d2d]/10 text-[#ff4d2d] px-4 py-0.5 rounded-md text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]/15">
                            <i className="ri-add-fill text-xl"></i>
                            <span className='md:block hidden outline-none font-medium'>Add new shop</span>
                        </button>
                        <button onClick={() => navigate("/create-shop")} className="md:hidden flex items-center text-center gap-2 bg-[#ff4d2d]/10 text-[#ff4d2d] px-2 py-1 rounded-full text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]/15">
                            <i className="ri-add-fill text-xl"></i>
                        </button>
                    </div>
                )}

                <button onClick={() => navigate("/my-orders")} className='md:block font-medium bg-[#ff4d2d]/10 text-[#ff4d2d] px-4 py-1.5 rounded-md text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]/15 outline-none'>My Orders</button>

                <div className="profile-div">
                    <div onClick={() => setProfileOpen(prev => !prev)} className="w-[35px] h-[35px] bg-[#ff4d2d] text-white rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] uppercase">{userData.fullName.slice(0,1)}</div>
                    {profileOpen && (
                        <div className="fixed top-[80px] right-[10px] md:right-[33%] w-[180px] bg-white shadow-2xl rounded-md px-5 py-2 z-[9999] flex flex-col gap-1">
                            <h1 className='font-semibold capitalize'>{userData.fullName}</h1>
                            <h4 className='font-medium'>Role :- {userData.role}</h4>
                            <h2 onClick={handleLogout} className='logout font-medium cursor-pointer active:scale-95 text-[#ff4d2d]'>Log Out <i className="ri-logout-box-r-line"></i></h2>
                        </div>
                    )}
                </div>
            </div>
        </main>
    </>
  )
}

export default OwnerNav;
