import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UserOrder = ({ data }) => {

  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit"
    })
  }

  const deleteHandler = async () => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this my order?");
      if (!confirm) return;
      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/orders/delete/${data._id}`, { withCredentials: true });
      if(response.data) {
        toast.success("Item deleted successfully");
        window.location.reload();
      }
        
    } catch (error) {
      throw error;
    }
  }
  

  return (
    <>
      <main className='bg-white rounded-md shadow p-4 space-y-4'>
        <div className="flex justify-between border-b pb-2">
          <div className="left-side">
            <p className='font-semibold'>order #{data?._id.slice(-6)}</p>
            <p className='text-sm text-gray-500'>Date: {formatDate(data?.createdAt)}</p>
          </div>
          <div className="right-side">
            <p className='text-sm text-gray-500 uppercase'><span className='capitalize text-lg text-gray-700'>Payment Method :</span> {data?.paymentMethod}</p>
            {data?.paymentMethod === "online" ? <p>Payment Status : {data?.payment ? "True" : "False"}</p> : ""}
          </div>
        </div>
        {data?.shopOrders?.map((shopOrder, idx) => (
          <div className="border rounded-md p-2 bg-[#fffaf7] space-y-3" key={idx}>
            <p className='capitalize font-semibold'>{shopOrder?.shop?.name}</p>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {shopOrder?.shopOrderItems?.map((item, idx) => (
                <div key={idx} className="w-40 flex-shrink-0 border rounded-md p-2 bg-white">
                  <img src={item?.item?.image} alt="" className='w-full h-24 object-cover rounded' />
                  <p className='capitalize font-semibold text-sm mt-1'>{item?.name}</p>
                  <p className='text-xs text-gray-500'><span className='text-gray-800 font-semibold'>Qty :- </span> {item?.quantity} x <span className='text-gray-800 font-semibold'>₹</span>{item?.price} = ₹{item?.quantity * item?.price}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <p className='font-semibold'>Total :- ₹{shopOrder?.subTotal}</p>
              <p className='font-medium text-sm text-blue-500'>{shopOrder?.status}</p>
            </div>
          </div>
        ))}
        <div className="md:flex items-center justify-between border-t pt-2">
          <p className='font-semibold text-gray-800'>All Amount :- ₹{data?.totalAmount}</p>
          <div className="btn md:flex gap-2 flex justify-between mt-2">
            <button onClick={() => navigate(`/user-track-order/${data._id}`)} className='bg-[#ff4d2d] px-4 py-2 rounded-md text-white cursor-pointer hover:bg-[#e64526] transition active:scale-95 capitalize'>track order</button>
            <button onClick={() => deleteHandler()} className='text-xl text-red-600 cursor-pointer active:scale-95'><i className="ri-delete-bin-line"></i></button>
          </div>
        </div>
      </main>
    </>
  )
}

export default UserOrder
