import React from 'react'
import { useNavigate } from 'react-router-dom'

const OrderPlaced = () => {

    const navigate = useNavigate();

  return (
    <>
      <main className='min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center text-center px-4'>
        <i className="ri-checkbox-circle-fill text-green-600 text-6xl mb-3"></i>
        <h1 className='font-bold text-3xl text-gray-800 mb-2'>Order Placed !</h1>
        <p className='text-gray-600 max-w-md mb-5'>Thank you for your purchase. Your order is being prepared, You can track your order status in the "My Orders" section.</p>
        <button onClick={() => navigate("/my-orders")} className='bg-[#ff4d2d] text-white px-6 py-3 rounded-md font-medium hover:bg-[#e64526] transition cursor-pointer active:scale-95'>Back to my orders</button>
      </main>
    </>
  )
}

export default OrderPlaced