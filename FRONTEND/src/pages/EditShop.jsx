import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners'

const EditShop = () => {

  const { id } = useParams();

  const navigate = useNavigate("");

  const { myShopData } = useSelector(state => state.owner);
  
  const shopdetails = myShopData.find(shop => shop._id === id);

  const [name, setName] = useState(shopdetails?.name);
  const [frontendImage, setFrontendImage] = useState(shopdetails?.image);
  const [backendImage, setBackendImage] = useState("");
  const [city, setCity] = useState(shopdetails?.city);
  const [state, setState] = useState(shopdetails?.state);
  const [address, setAddress] = useState(shopdetails?.address);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleImage = (e) => {
    const file = e.target.files[0]
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);
      if(backendImage) {
        formData.append("image", backendImage);
      }
      

      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/shops/edit/${id}`, formData, { withCredentials: true });

      const updateShop = myShopData.map(shop => shop._id === id ? response.data : shop)

      dispatch(setMyShopData(updateShop));
      toast.success("Shop updated successfully!");
      localStorage.setItem("myShopData", JSON.stringify(updateShop));
      setLoading(false);
      navigate("/home");

    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Edit Shop failed");
    }

  }

  return (
    <>
      <main className='flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen'>
        <div className="w-full max-w-lg bg-white shadow-xl rounded-md p-5 border border-orange-100">
          <div className="icon-div-upper flex items-center md:gap-[38%] gap-[30%]">
            <i onClick={() => navigate("/home")} className="ri-arrow-left-long-line text-2xl cursor-pointer active:scale-95"></i>
            <FaUtensils className='text-[#ff4d2d] w-16 h-16 mb-4 bg-orange-100 p-4 rounded-full'/>
          </div>
          <h1 className='font-semibold text-gray-900 text-xl'>Edit Shop</h1>
          <form className='space-y-4'>
            <div className="name-div">
              <label className='font-medium text-sm text-gray-700'>Name</label>
              <input 
                type="text" 
                placeholder='Enter Shop Name' 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              />
            </div>
            <div className="image-div">
              <label className='font-medium text-sm text-gray-700'>Image</label>
              <input 
                type="file" 
                accept='image/*' 
                onChange={handleImage}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              />
              {frontendImage && (
                <div className="mt-2">
                  <img src={frontendImage} alt="" className='w-full h-36 object-cover rounded-md border' />
                </div>
              )}
            </div>
            <div className="city-state-div-container flex gap-5">
              <div className="city-div">
                <label className='font-medium text-sm text-gray-700'>City</label>
                <input 
                  type="text" 
                  placeholder='Enter City' 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
                />
              </div>
              <div className="name-div">
                <label className='font-medium text-sm text-gray-700'>State</label>
                <input type="text"
                  placeholder='Enter State' 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
                />
              </div>
            </div>
            <div className="address-div">
              <label className='font-medium text-sm text-gray-700'>Address</label>
              <input type="text" 
                placeholder='Enter Address' 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              />
            </div>
            <button onClick={handleSubmit} className='bg-[#ff4d2d] text-white px-5 py-2 mt-5 rounded-md w-full uppercase cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]'>
              {loading ? <ClipLoader size={20} color='white' /> : "edit shop"}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

export default EditShop;
