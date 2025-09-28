import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import UserOrder from '../components/UserOrder';
import OwnerOrder from '../components/OwnerOrder';
import { useEffect } from 'react';
import { setMyOrders, socketDeleteMyOrder, updateOrderStatus } from '../redux/userSlice';
import DeliveryBoyOrder from '../components/DeliveryBoyOrder';

const MyOrders = () => {

    const { myOrders, userData, socket } = useSelector(state => state.user);
 
    const ordresArray = Array.isArray(myOrders) ? myOrders : [myOrders];
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      if (!socket) return;

      const handleNewOrder = (data) => {
        const isOwnerOrder = data.shopOrders?.some(
          shopOrder => shopOrder.owner._id === userData._id
        );

        if (isOwnerOrder) {
          const currentOrders = JSON.parse(localStorage.getItem("order")) || [];

          const existingOrderIndex = currentOrders.findIndex(order => order._id === data._id);

          if (existingOrderIndex !== -1) {
            const updatedOrders = [...currentOrders];
            const existingShopOrders = updatedOrders[existingOrderIndex].shopOrders;

            data.shopOrders.forEach(newShopOrder => {
              const alreadyHas = existingShopOrders.some(
                s => s._id === newShopOrder._id
              );
              if (!alreadyHas) {
                existingShopOrders.push(newShopOrder);
              }
            });

            dispatch(setMyOrders(updatedOrders));
          } else {
            dispatch(setMyOrders([data, ...currentOrders]));
          }
        }
      };

      const handleUpdateStatus = ({ orderId, shopId, status, userId }) => {
        if (userId === userData._id) {
          dispatch(updateOrderStatus({ orderId, shopId, status }));
        }
      };

      const handleDeleteOrder = (orderId) => {
        dispatch(socketDeleteMyOrder(orderId));
      }

      

      socket.on("newOrder", handleNewOrder);
      socket.on("update-status", handleUpdateStatus);
      socket.on("delete-order", handleDeleteOrder);

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket.off("update-status", handleUpdateStatus);
      socket.off("delete-order", handleDeleteOrder);
    };
  }, [socket, userData, dispatch]);

  return (
    <>
      <main className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
        <div className="w-full max-w-[800px] p-4">
          <div className="icon-div-upper flex items-center md:gap-[38%] gap-[30%] pb-5">
            <i onClick={() => navigate("/home")} className="ri-arrow-left-long-line text-2xl cursor-pointer active:scale-95"></i>
            <h1 className='font-semibold text-2xl text-gray-800'>My Orders</h1>
          </div>
          <div className="space-y-6">
            {userData?.role === "user" ? (
              ordresArray?.length > 0 ? (
                ordresArray.map((order, idx) => (
                  <UserOrder key={idx} data={order} />
                ))
              ) : (
                <p className="text-center text-gray-500">No orders found. 😂😂</p>
              )
            ) : userData?.role === "owner" ? (
              ordresArray?.length > 0 ? (
                ordresArray.map((order, idx) => (
                  <OwnerOrder key={idx} data={order} />
                ))
              ) : (
                <p className="text-center text-gray-500">No orders found. 😂😂</p>
              )
            ) : userData?.role === "deliveryboy" ? (
              <DeliveryBoyOrder />
            ) : null}
          </div>


        </div>
      </main>
    </>
  )
}

export default MyOrders
