import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import { useSelector } from 'react-redux';

const UserTrackOrderPage = () => {

    const { socket } = useSelector(state => state.user);

    const {id} = useParams();
    const navigate = useNavigate();

    const [currentOrder, setCurrentOrder] = useState("");
    const [liveLocation, setLiveLocation] = useState({});

    const handleTrackOrder = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/track-order-user/${id}`, { withCredentials: true });
            setCurrentOrder(response.data);
        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    };

    useEffect(() => {
        handleTrackOrder();
    }, [id]);

    useEffect(() => {
        socket.on("update-delivery-location", ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocation(prev => ({
                ...prev,
                [deliveryBoyId] : { lat: latitude, lon: longitude }
            }))
        })
    }, [socket]);

  return (
    <>
      <main className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
        <div className="icon-div flex items-center md:gap-[40%] gap-[25%]">
            <i onClick={() => navigate("/my-orders")} className="ri-arrow-left-long-line text-2xl cursor-pointer active:scale-95"></i>
            <h1 className='font-semibold md:text-3xl text-xl'>Track Order</h1>
        </div>

        {currentOrder?.shopOrders?.length > 0 ? (
            currentOrder?.shopOrders?.map((shopOrder, idx) => (
                <div key={idx} className="bg-white p-4 rounded-md shadow-md border border-orange-100 space-y-4">
                    <h1 className="text-xl font-bold px-4 pb-2 flex items-center gap-2">🏪 Shop details</h1>
                    <p className="capitalize font-semibold text-xl">Shop Name : <span className="text-lg">{shopOrder?.shop?.name}</span></p>
                    <p className="capitalize text-sm text-gray-500"><span className="font-semibold text-lg text-gray-800">Address : </span>{currentOrder?.deliveryAddress?.text}</p>

                    {shopOrder?.shopOrderItems?.map((item, index) => (
                        <div key={index} className="mt-2">
                            <p className="capitalize text-sm text-gray-500"><span className="font-semibold text-gray-800 text-lg">{index + 1}. item name :-{" "}</span>{item?.name}</p>
                            <p className="capitalize text-sm text-gray-500"><span className="font-semibold text-gray-800">Quantity :- </span>{item?.quantity} x ₹{item?.price} = ₹ {item?.quantity * item?.price}</p>
                        </div>
                    ))}

                    <p className="text-sm text-gray-500 mt-2"><span className="font-semibold text-gray-800">All items : </span>{currentOrder?.shopOrders?.length}{" "}{currentOrder?.shopOrders?.length === 1 ? "item" : "items"}</p>
                    <p className="text-lg text-gray-800 font-medium mt-2">Payment Type 💵 :{" "}<span className="font-smedium text-lg text-gray-500 uppercase">{currentOrder?.paymentMethod}</span></p>
                    <p className="text-lg text-green-700 font-medium mt-2">Status :{" "}<span className="font-smedium text-lg text-green-500 uppercase">{shopOrder?.status}</span></p>
                    <p className="font-medium text-[#ff4d2d] mt-2 text-xl"> TotalAmount: ₹{shopOrder.subTotal}</p>

                    {shopOrder.status === "out of delivery" && (
                        <>
                            {shopOrder?.assignedDeliveryBoy ? (
                                <>
                                    <div className="delivery-boy-details">
                                        <h1 className="text-xl font-bold p-4 flex items-center gap-2">🚚 DeliveryBoy details</h1>
                                        <p className="capitalize text-sm text-gray-500"><span className="font-semibold text-gray-800 text-lg">Boy name :-{" "}</span>{shopOrder?.assignedDeliveryBoy?.fullName}</p>
                                        <p className="text-lg text-gray-600 mt-1"><span className="font-semibold text-gray-800">Email 📩 : </span>{shopOrder?.assignedDeliveryBoy?.email}</p>
                                        <p className="text-lg text-gray-600 mt-1"><span className="font-semibold text-gray-800">Contact 📞 : </span>{shopOrder?.assignedDeliveryBoy?.mobile}</p>
                                    </div>

                                    <div className="user-details-div">
                                        <h1 className="text-xl font-bold p-4 flex items-center gap-2">👤 User details</h1>
                                        <p className="text-lg text-gray-600 mt-1"><span className="font-semibold text-gray-800">Name : </span>{currentOrder?.user?.fullName}</p>
                                        <p className="text-lg text-gray-600 mt-1"><span className="font-semibold text-gray-800">Email 📩 : </span>{currentOrder?.user?.email}</p>
                                        <p className="text-lg text-gray-600 mt-1"><span className="font-semibold text-gray-800">Contact 📞 : </span>{currentOrder?.user?.mobile}</p>
                                    </div>

                                    <div className="map-tracking-div w-full md:h-[530px] h-[400px] mt-5 mb-10 rounded-md overflow-hidden shadow-md">
                                        <DeliveryBoyTracking
                                            data={{
                                                deliveryBoyLocation: liveLocation[shopOrder?.assignedDeliveryBoy?._id] || {
                                                    lat: shopOrder?.assignedDeliveryBoy?.location?.coordinates[1],
                                                    lon: shopOrder?.assignedDeliveryBoy?.location?.coordinates[0],
                                                },
                                                customerLocation: {
                                                    lat: currentOrder?.deliveryAddress?.latitude,
                                                    lon: currentOrder?.deliveryAddress?.longitude,
                                                },
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (<p className="text-center text-yellow-600 font-medium mt-4">⏳ Waiting for delivery boy to accept the order...</p>)
                            }
                        </>
                    )}
                </div>
            ))
            ) : (
            <p className="text-center text-gray-500">Sorry,🙏 No orders found.</p>
        )}

      </main>
    </>
  )
}

export default UserTrackOrderPage;
