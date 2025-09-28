import React, { useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { addToCart } from '../redux/userSlice';

import { FaLeaf } from "react-icons/fa";
import { FaDrumstickBite } from "react-icons/fa6";
import { toast } from 'react-toastify';

const ItemCard = ({ data }) => {

  const [quantity, setQuantity] = useState(0);
  
  const dispatch = useDispatch();

  const { cartItems } = useSelector(state => state.user);

  const handleIncrease = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
  };


  const handleDecrease = () => {
    if(quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity)
    }
  };


  const handleAddToCart = () => {
    if(quantity > 0) {
      let shopId = data.shop;
      if (typeof shopId === "object" && shopId !== null) {
        shopId = shopId._id ? shopId._id.toString() : shopId.toString();
      }

      dispatch(addToCart({
        id: typeof data._id === "object" ? data._id.toString() : data._id,
        name: data.name,
        price: data.price,
        image: data.image,
        shop: shopId,
        quantity,
        foodType: data.foodType
      }));

      localStorage.setItem("cart", JSON.stringify([...cartItems, {
        id: typeof data._id === "object" ? data._id.toString() : data._id,
        name: data.name,    
        price: data.price,
        image: data.image,
        shop: shopId,
        quantity,
        foodType: data.foodType
      }]));
    }
    else {
      toast.error("Please select quantity first!");
    }
  };


  return (
    <>
      <main className="main">
        <div className='md:w-[310px] w-[300px] rounded-md border-2 border-[#ff4d2d] bg-white overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col'>
          <div className="image-div relative w-full h-[170px] flex items-center justify-center bg-white">
            <div className="absolute top-3 right-3 bg-white z-10 p-2 rounded-full shadow">
              {data.foodType === "veg" ? <FaLeaf className='text-green-600 text-lg' /> : <FaDrumstickBite className='text-red-600' /> }
            </div>
            <img src={data.image} alt="" className='w-full h-full object-cover transition-transform duration-300 hover:scale-105' />
          </div>
          <div className="details-div flex flex-1 flex-col p-4">
            <h1 className='font-semibold text-gray-900 text-base truncate capitalize'>{data?.name}</h1>
            <div className="price-cart-div flex items-center justify-between">
              <div className="price-div">
                <h2 className='font-semibold'>₹{data?.price}</h2>
              </div>
              <div className="cart-div flex items-center border rounded-full overflow-hidden shadow-lg">
                <button onClick={handleDecrease} className='px-2 py-1 hover:bg-gray-100 transition cursor-pointer active:scale-95'><i className="ri-subtract-line"></i></button>
                <span>{quantity}</span>
                <button onClick={handleIncrease} className='px-2 py-1 hover:bg-gray-100 transition cursor-pointer active:scale-95'><i className="ri-add-fill"></i></button>
                <button onClick={handleAddToCart} className={`${cartItems.some(item => item?.id == data?._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-3 py-2 cursor-pointer active:scale-95 transition overflow-hidden`}><i className="ri-shopping-cart-fill"></i></button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default ItemCard
