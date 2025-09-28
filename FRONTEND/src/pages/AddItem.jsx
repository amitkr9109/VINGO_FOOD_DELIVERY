import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners'

const AddItem = () => {

  const { id } = useParams();
  const { myShopData } = useSelector(state => state.owner);

  const navigate = useNavigate("");

  const [name, setName] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("");
  const [loading, setLoading] = useState(false);


  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ]

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
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("price", price);
      formData.append("shopId", id); 
      if(backendImage) {
        formData.append("image", backendImage);
      }
      

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/items/item-add`, formData, { withCredentials: true });

      const updatedShop = response.data;
      const updatedShops = myShopData.map(shop => 
        shop._id === updatedShop._id ? updatedShop : shop
      );
      dispatch(setMyShopData(updatedShops));
      toast.success("Item added successfully");
      localStorage.setItem("myShopData", JSON.stringify(updatedShops));
      setLoading(false);
      navigate(`/all-item/${id}`);

    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Add Item failed");
    }

    setName("");
    setPrice("");
    setCategory("");
    setFoodType("");
  }

  return (
    <>
      <main className='flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen'>
        <div className="w-full max-w-lg bg-white shadow-xl rounded-md p-5 border border-orange-100">
          <div className="icon-div-upper flex items-center md:gap-[38%] gap-[30%]">
            <i onClick={() => navigate(`/all-item/${id}`)} className="ri-arrow-left-long-line text-2xl cursor-pointer active:scale-95"></i>
            <FaUtensils className='text-[#ff4d2d] w-16 h-16 mb-4 bg-orange-100 p-4 rounded-full'/>
          </div>
          <h1 className='font-semibold text-gray-900 text-xl'>Add Food Item</h1>
          <form className='space-y-4'>
            <div className="name-div">
              <label className='font-medium text-sm text-gray-700'>Name</label>
              <input 
                type="text" 
                placeholder='Enter Item Name' 
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
            <div className="price-div">
              <label className='font-medium text-sm text-gray-700'>Price</label>
              <input type="number" 
                placeholder='Enter Price' 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              />
            </div>
            <div className="category-div">
              <label className='font-medium text-sm text-gray-700'>Select Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              >
                <option value="">Select Categories</option>
                {categories.map((allcategories, idx) => (
                    <option key={idx} value={allcategories}>{allcategories}</option>
                ))}
              </select>
            </div>
            <div className="foodType-div">
              <label className='font-medium text-sm text-gray-700'>Select Food Type</label>
              <select 
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1' 
              >
                <option value="">Select Food Type</option>
                <option value="veg">Veg</option>
                <option value="non veg">Non Veg</option>
              </select>
            </div>
            <button onClick={handleSubmit} className='bg-[#ff4d2d] text-white px-5 py-2 mt-5 rounded-md w-full uppercase cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "add item"}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

export default AddItem;
