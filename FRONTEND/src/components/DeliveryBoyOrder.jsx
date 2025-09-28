import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const DeliveryBoyOrder = () => {

    const { userData } = useSelector(state => state.user);

    const [deliveryData, setDeliveryData] = useState([]);

    const handleMyDeliveryData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/all-orders-delivery-boy`, { withCredentials: true });
            setDeliveryData(response.data);
        } catch (error) {
            throw error;
        }
    }

    const deleteHandler = async (id) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this my order history?");
            if (!confirm) return;
            const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}/orders/history-delete/${id}`, { withCredentials: true });
            if(response.data) {
                toast.success("Item deleted successfully");
                window.location.reload();
            }
            
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        handleMyDeliveryData();
    }, [userData]);

  return (
    <>
      <main className='bg-white rounded-md shadow p-4 space-y-4'>
        <div className="delivery-data-show">
            <h2 className="text-lg font-semibold mb-5">My Deliveries History</h2>
            <ul className="space-y-5">
                {deliveryData.length > 0 ? (
                    deliveryData.map((item, idx) => (
                    <li key={idx} className="border px-5 py-3 rounded-md">
                      <p className='capitalize mt-1'><span className='font-semibold'>Shop Name 🏪 : </span>{item?.shop?.name}</p>
                      <p className='capitalize'><span className='font-semibold'>Status ✅ : </span>{item?.status}</p>
                      <p className='capitalize'><span className='font-semibold'>Delivered At 🚚: </span>{new Date(item?.completedAt).toLocaleString()}</p>
                      <div className="flex justify-end">
                        <button onClick={() => deleteHandler(item._id)} className='text-xl text-red-600 cursor-pointer active:scale-95'>Delete<i className="ri-delete-bin-fill"></i></button>
                      </div>
                    </li>
                    ))
                ) : (
                    <p>No deliveries yet.</p>
                )}
            </ul>

        </div>
      </main>
    </>
  )
}

export default DeliveryBoyOrder
