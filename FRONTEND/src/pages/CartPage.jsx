import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import CartItemCard from '../components/CartItemCard';

const CartPage = () => {

    const navigate = useNavigate("");

    const { cartItems, totalAmount } = useSelector(state => state.user);

  return (
    <>
        <main className='min-h-screen bg-[#fff9f6] flex justify-center p-5'>
            <div className="w-full max-w-[800px]">
                <div className="heading-div flex items-center justify-between">
                    <i onClick={() => navigate("/home")} className="ri-arrow-left-long-line cursor-pointer active:scale-95 text-[#ff4d2d] text-lg"></i>
                    <h1 className='text-xl font-bold'>Your Cart</h1>
                </div>
                {cartItems.length === 0 ? (
                    <p className='text-gray-500 text-lg text-center mt-10'>Your cart is empty 😂😂</p>
                ) : (
                    <>
                        <div>
                            {cartItems?.map((item, idx) => (
                                <CartItemCard key={idx} data={item} />
                            ))}
                        </div>
                        <div className="mt-6 bg-white p-4 rounded-md shadow flex items-center justify-between border">
                            <h1 className='text-lg font-semibold'>Total Amount</h1>
                            <span className='text-xl font-bold text-[#ff4d2d]'>₹{totalAmount}</span>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => navigate("/checkout")} className='bg-[#ff4d2d] text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-[#e64526] transition cursor-pointer active:scale-95'>Proced to CheckOut</button>
                        </div>
                    </>
                )}
            </div>
        </main>
    </>
  )
}

export default CartPage
