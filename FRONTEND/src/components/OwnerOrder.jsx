import axios from 'axios';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';

const OwnerOrder = ({ data }) => {

  const dispatch = useDispatch();

  const [availableBoys, setAvailableBoys] = useState([]);

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/orders/update-status/${orderId}/${shopId}`, {status}, { withCredentials: true });
      toast.success("Order status change success");
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableBoys(response.data.availableBoys);
    } catch (error) {
      toast.error(error.response?.data?.message || "Order status change failed");
    }
  }

  return (
    <>
      <main className='bg-white rounded-md shadow p-4 space-y-4'>
        <div className="user-details-div">
          <h2 className='font-semibold tetx-xl'>{data?.user?.fullName}</h2>
          <p className='text-sm text-gray-500'>{data?.user?.email}</p>
          <p className='text-sm text-gray-600 flex items-center gap-2 pt-1'><i className="ri-phone-fill"></i>{data?.user?.mobile}</p>
          <p className='text-sm text-gray-500 uppercase'><span className='capitalize text-lg text-gray-700'>Payment Method :</span> {data?.paymentMethod}</p>
          {data?.paymentMethod === "online" ? <p>Payment Status : {data?.payment ? "True" : "False"}</p> : ""}
        </div>
        <div className="user-address-div flex items-start gap-2 text-gray-600">
          <p className='text-sm text-gray-500'>{data?.deliveryAddress?.text}</p>
        </div>
        <div className="flex space-x-4 flex-col gap-2 overflow-x-auto pb-2">
          {data?.shopOrders?.map((shopOrder, idx) => (
            <div className="border-[1px] border-gray-300 rounded-md px-5 py-2 bg-[#fffaf7] space-y-1" key={idx}>
              <p className='capitalize font-semibold'>{shopOrder?.shop?.name}</p>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {shopOrder?.shopOrderItems?.map((item, idx) => (
                  <div key={idx} className="md:w-64 w-[62vw] flex-shrink-0 border rounded-md p-2 bg-white">
                    <img src={item?.item?.image} alt="" className='w-full md:h-32 h-28 object-cover object-center rounded' />
                    <p className='capitalize font-semibold text-sm mt-1'>{item?.name}</p>
                    <p className='text-xs text-gray-500'><span className='text-gray-800 font-semibold'>Qty :- </span> {item?.quantity} x <span className='text-gray-800 font-semibold'>₹</span>{item?.price} = ₹{item?.quantity * item?.price}</p>
                  </div>
                ))}
              </div>

              <p className='font-semibold'>Total :- ₹{shopOrder?.subTotal}</p>
              <div className="flex items-center justify-between">
                <p className='font-medium text-sm text-[#ff4d2d] capitalize'>{shopOrder?.status}</p>
                <select onChange={(e) => handleUpdateStatus(data._id, shopOrder?.shop._id, e.target.value)} className='rounded-md border px-3 py-1 text-sm focus:outline-none text-[#ff4d2d]'>
                  <option value="">Change</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="out of delivery">Out of delivery</option>
                </select>
              </div>

              {shopOrder?.status == "out of delivery" && 
                <div className="mt-3 p-2 border rounded-md text-sm bg-orange-50">
                  {shopOrder?.assignedDeliveryBoy ? <p className='font-semibold'>Assigned Delivery Boy</p> : <p className='font-semibold'>Available Delivery Boys</p>}
                  {availableBoys?.length > 0 ? (
                    availableBoys.map((boy, idx) => (
                      <div key={idx} className="text-gray-500 capitalize flex items-center gap-1">
                        <span className='font-semibold text-gray-800 text-xl'><i className="ri-account-circle-fill"></i></span>{boy?.fullName}
                        <span className='font-semibold text-gray-800 text-lg'> <i className="ri-phone-fill"></i></span>{boy?.mobile}
                      </div>
                    ))
                  ) : shopOrder.assignedDeliveryBoy ? 
                    <div className='capitalize text-gray-800'> 
                      {shopOrder?.assignedDeliveryBoy?.fullName} - {shopOrder?.assignedDeliveryBoy?.mobile}
                    </div> 
                    : 
                    <div className='text-gray-900'>Waiting for delivery boy to accept</div>
                  } 
                </div>
              }
            </div>
          ))}
        </div>
        {data?.shopOrders?.length > 1 ? (
          <div className="border-t pt-2 mt-2 flex justify-end">
            <p className='font-semibold text-gray-800'>All Amount :- ₹{data?.totalAmount}</p>
          </div>
        ) : (
          <div className="border-t pt-2 mt-2 flex justify-end">
            <p className='font-semibold text-gray-800'>All Amount :- ₹{data?.totalAmount}</p>
          </div>
        )}
      </main>
    </>
  )
}

export default OwnerOrder
