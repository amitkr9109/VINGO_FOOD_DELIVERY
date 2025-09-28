import React from 'react'
import { useSelector } from "react-redux"
import OwnerNav from './OwnerNav';
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OwnerHome = () => {

  const ownerState = useSelector(state => state.owner) || {};
  const { myShopData = [] } = ownerState;


  const navigate = useNavigate();

  const deleteHandler = async (shopId) => {
    const confirm = window.confirm("Are you sure you want to delete this shop?");
    if (!confirm) return;

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/shops/delete/${shopId}`, { withCredentials: true });
      if (response.data) {
        toast.success("Shop deleted successfully");
        navigate("/home");
        window.location.reload();
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <>
      <main className='w-full min-h-screen flex flex-col items-center bg-[#fff9f6]'>
        <OwnerNav />

        {!myShopData || myShopData.length === 0 ? (
          <div className="flex items-center justify-center p-4 sm:p-6 mt-20">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <FaUtensils className='text-[#ff4d2d] w-16 h-16 mb-4'/>
                <h2 className='text-xl font-bold text-gray-800 mb-2'>Add Your Restaurant</h2>
                <p className='text-gray-600 text-sm'>Join our food delivery platform and reach thousands of hungry customers every day.</p>
                <button onClick={() => navigate("/create-shop")} className='bg-[#ff4d2d] text-white px-5 py-2 mt-5 rounded-md w-full uppercase cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]'>add shop</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 w-full flex flex-col items-center gap-5 px-4 mb-5">
            {myShopData.map(shop => (
              <div key={shop?._id} className="w-full max-w-5xl flex flex-col items-center gap-5">
                <h1 className='text-2xl text-gray-900 flex items-center gap-2 text-center capitalize'>
                  <FaUtensils className='text-[#ff4d2d] w-10 h-10' />Welcome to {shop?.name}
                </h1>
                <div className="bg-white shadow-lg rounded-md w-full md:h-full overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300">
                  <div className="image-div w-full md:h-96 sm:h-64">
                    <img src={shop?.image} alt={shop?.name} className='w-full h-full object-cover object-center' />
                  </div>
                  <div className="p-4 mt-10">
                    <h1 className='text-xl sm:text-2xl font-bold text-gray-800 capitalize'>{shop?.name}</h1>
                    <p className='text-gray-500 capitalize'>{shop?.city}, {shop?.state}</p>
                    <p className='text-gray-500 capitalize'>{shop?.address}</p>
                    <div className="update-allshowitems-delete-div flex items-center justify-between mt-4">
                      <p onClick={() => navigate(`/edit-shop/${shop._id}`)} className='text-blue-600 font-semibold cursor-pointer active:scale-95'>Update <i className="ri-refresh-line"></i></p>
                      <p onClick={() => navigate(`/all-item/${shop._id}`)} className='text-green-500 font-semibold cursor-pointer active:scale-95'>Shop Items <i className="ri-eye-line"></i></p>
                      <p onClick={() => deleteHandler(shop._id)} className='text-red-600 font-semibold cursor-pointer active:scale-95'>Delete <i className="ri-delete-bin-line"></i></p>
                    </div>
                  </div>
                </div>

                {shop.items.length === 0 && (
                  <div className="flex items-center justify-center px-4 md:py-4">
                    <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                      <div className="flex flex-col items-center text-center">
                        <FaUtensils className='text-[#ff4d2d] w-14 h-14 mb-2'/>
                        <h2 className='text-xl font-bold text-gray-800'>Add Your Food Item</h2>
                        <p className='text-gray-600 text-sm'>Share your delicious creations with our customers by adding them to the menu.</p>
                        <button onClick={() => navigate(`/add-item/${shop._id}`)} className='bg-[#ff4d2d] text-white px-5 py-2 mt-5 rounded-md w-full uppercase cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]'>add food</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default OwnerHome;
