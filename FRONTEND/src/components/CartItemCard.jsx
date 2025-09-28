import React from 'react'
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';

const CartItemCard = ({ data }) => {

  const dispatch = useDispatch();

  const handleIncrease = (id, currentQuantity) => {
    dispatch(updateQuantity({ id, quantity: currentQuantity + 1 }))
  }

  const handleDecrease = (id, currentQuantity) => {
    if(currentQuantity > 1) {
      dispatch(updateQuantity({ id, quantity: currentQuantity - 1 }));
    }
  }

  return (
    <>
      <main className='flex items-center justify-between bg-white p-4 rounded-xl shadow border mt-5'>
        <div className="iamge-div flex items-center gap-4">
          <img src={data?.image} alt="" className='w-20 h-20 object-cover rounded-md' />
          <div className="details-div">
            <h1 className='font-medium text-gray-800 capitalize'>{data?.name}</h1>
            <p className='text-sm text-gray-600'>₹ {data?.price} x {data?.quantity}</p>
            <p className='font-bold text-gray-900'>₹ {data?.price * data?.quantity}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className=" bg-gray-100 rounded-md">
            <button onClick={() => handleDecrease(data?.id, data?.quantity)} className='p-2 rounded-full hover:bg-gray-100 cursor-pointer active:scale-95'><i className="ri-subtract-line"></i></button>
            <span>{data?.quantity}</span>
            <button onClick={() => handleIncrease(data?.id, data?.quantity)} className='p-2 rounded-full hover:bg-gray-100 cursor-pointer active:scale-95'><i className="ri-add-fill"></i></button>
          </div>
          <button onClick={() => dispatch(removeCartItem(data?.id))} className='text-xl text-red-600 cursor-pointer active:scale-95'><i className="ri-delete-bin-line"></i></button>
        </div>
      </main>
    </>
  )
}

export default CartItemCard
