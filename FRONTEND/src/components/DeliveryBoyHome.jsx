import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from "react-redux"
import DeliveryNav from './DeliveryNav';
import axios from 'axios';
import { toast } from 'react-toastify';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { ClipLoader } from 'react-spinners';


const DeliveryBoyHome = () => {

  const userState = useSelector(state => state.user) || {};
  const { userData = null, socket = null } = userState;


  const [availableAssignments, setAvailableAssignments] = useState("");
  const [currentOrder, setCurrentOrder] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);

  const [firstOtp, setFirstOtp] = useState("");
  const [secondOtp, setSecondOtp] = useState("");
  const [thirdOtp, setThirdOtp] = useState("");
  const [forthOtp, setForthOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderJustDelivered, setOrderJustDelivered] = useState(false);
  const [updateDeliveryBoyLocation, setUpdateDeliveryBoyLocation] = useState("");

  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const forthRef = useRef(null);
  

  const handleDeliveryAssignments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/delivery-assignment`, { withCredentials: true });
      setAvailableAssignments(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "delivery assignment failed");
    }
  }

  const handleAcceptOrder = async (assignmentId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/accept-order/${assignmentId}`, { withCredentials: true });
      await handleCurrentOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "accept order failed");
    }
  }

  const handleCurrentOrder = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/orders/current-order`, { withCredentials: true });
      setCurrentOrder(response.data);
    } catch (error) {
      return
    }
  }

  useEffect(() => {
    handleDeliveryAssignments();
    handleCurrentOrder();
  }, [userData]);



  const handleSendOtp = async () => {

    setLoading(true);

    const newData = {
      orderId: currentOrder._id,
      shopOrderId: currentOrder.shopOrder._id
    }

    try {   
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/orders/send-delivery-otp`, newData, { withCredentials: true });
      toast.success("OTP sent successfully");
      setLoading(false);
      setShowOtpBox(true);
      setServerOtp(response.data.otp);
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  }

  const handleInput = (e, setValue, nextRef) => {
    const val = e.target.value;
    if(/^[0-9]?$/.test(val)) {
      setValue(val);
      if(val && nextRef) {
        nextRef.current.focus();
      }
    }
  }

  const handleKeyDown = (e, setValue, prevRef) => {
    if(e.key === "Backspace" && !e.target.value && prevRef) {
      prevRef.current.focus();
      setValue("");
    }
  }

  const handleSubmitOTP = async () => {
    if(!firstOtp || !secondOtp || !thirdOtp || !forthOtp) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    const otp = firstOtp + secondOtp + thirdOtp + forthOtp;
    const newData = {
      orderId: currentOrder._id,
      shopOrderId: currentOrder.shopOrder._id,
      otp
    }

    try {   
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/orders/verify-delivery-otp`, newData, { withCredentials: true })
      toast.success("OTP Verify and item deliverd to successfully!");
      setLoading(false);
      setShowOtpBox(false);  
      setCurrentOrder("");
      setOrderJustDelivered(true);

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
    

    setFirstOtp("");
    setSecondOtp("");
    setThirdOtp("");
    setForthOtp("");
    firstRef.current.focus();
  }

  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if(data.sentTo === userData._id) {
        setAvailableAssignments([ ...availableAssignments, data ]);
      }
    });


    return() => {
      socket?.off("newAssignment");
    }
  }, [socket]);


  useEffect(() => {
    if(!socket || userData.role !== "deliveryboy") return

    let watchId
    if(navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setUpdateDeliveryBoyLocation({ lat: latitude, lon: longitude })

        socket.emit("update-location", {
          latitude,
          longitude,
          userId: userData._id
        })
      }),
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000
      }
    }

    return () => {
      if(watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    }
  }, [socket, userData]);

  return (
    <>
      <main className='w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] overflow-y-auto'>
        <DeliveryNav />
        <div className="details-main-div w-full max-w-[800px] flex flex-col items-center gap-5 mt-22">
          <div className="details-div bg-white rounded-md shadow-md hover:shadow-xl transition p-5 w-[90%] border border-orange-100 flex flex-col items-center justify-center gap-2">
            <h1 className='capitalize font-bold text-[#ff4d2d]'>😊 Welcome, {userData?.fullName}</h1>
            <p className='font-semibold text-gray-800'>Email 📧:- <span className='text-gray-400 font-medium'>{userData?.email}</span></p>
            <p className='font-semibold text-gray-800'>Contact 📞:- <span className='text-gray-400 font-medium'>{userData?.mobile}</span></p>
          </div>
        </div>

        {!currentOrder && orderJustDelivered && (
          <div className="bg-green-200 mt-5 text-green-700 p-4 rounded-md mb-4 text-center font-semibold">Order delivered successfully! 🎉</div>
        )}

        {!currentOrder && !orderJustDelivered && (
          <div className="available-ordres-div bg-white rounded-md p-5 shadow-md md:w-[70%] w-[90%] border border-orange-100 mt-5 mb-10">
            <h1 className='text-xl font-bold mb-4 flex items-center gap-2'>Available Orders</h1>
            <div className="space-y-14">
              {availableAssignments?.length > 0 ? (
                availableAssignments?.map((assignment, idx) => (
                  <div key={idx} className="p-4 border rounded-md flex items-center justify-between">
                    <div className="shop-details-div w-full flex flex-col">
                      <p className='capitalize'><span className='font-semibold'>Shop Name : </span>{assignment?.shopName}</p>
                      <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-lg text-gray-800'>Address : </span>{assignment?.deliveryAddress?.text}</p>
                      <div className="items-showing-div space-y-2 mt-5">
                        {assignment?.items?.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-gray-800 text-lg'>{idx + 1}. item name :- </span>{item?.name}</p>
                            <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-gray-800'>Quantity :- </span> {item?.quantity} x ₹{item?.price} = ₹{item?.quantity * item?.price}</p>
                          </div>
                        ))}
                      </div>
                      <p className='text-sm text-gray-400 mt-2'><span className='font-semibold text-gray-800'>All items : </span>{assignment?.items?.length} {assignment?.items?.length === 1 ? "item" : "items"}</p>
                      <p className='text-[#ff4d2d]'><span className='font-semibold text-xl]'>Total Amount :- </span>₹{assignment?.subTotal}</p>
                      <button onClick={() => handleAcceptOrder(assignment.assignmentId)} className='bg-orange-400 text-white w-full py-3 rounded-md cursor-pointer hover:bg-orange-500 transition active:scale-95 mt-5 uppercase'>Accept</button>
                    </div>
                  </div>
                ))
              ) : <p className='text-gray-500 text-sm'>No Available Orders😂😂</p>}
            </div>
          </div>
        )}  
        

        {currentOrder && 
          <div className="current-ordres-div bg-white rounded-md p-5 shadow-md md:w-[70%] w-[90%] border border-orange-100 mt-5 mb-10">
            <h1 className='text-xl font-bold mb-4 flex items-center gap-2'>📦 Current Order</h1>
            <div className="border rounded-md p-4 mb-3">
              <h1 className='text-xl font-bold px-4 py-2 flex items-center gap-2'>🏪 Shop details</h1>
              <p className='capitalize'><span className='font-semibold'>Shop Name : </span>{currentOrder?.shop?.name}</p>
              <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-lg text-gray-800'>Address : </span>{currentOrder?.deliveryAddress?.text}</p>
              <div className="items-showing-div space-y-2 mt-5">
                {currentOrder?.shopOrder?.shopOrderItems?.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-gray-800 text-lg'>{idx + 1}. item name :- </span>{item?.name}</p>
                    <p className='capitalize text-sm text-gray-500'><span className='font-semibold text-gray-800'>Quantity :- </span> {item?.quantity} x ₹{item?.price} = ₹{item?.quantity * item?.price}</p>
                  </div>
                ))}
              </div>
              
              <p className='text-sm text-gray-400 mt-2'><span className='font-semibold text-gray-800'>All items : </span>{currentOrder?.shopOrder?.shopOrderItems?.length} {currentOrder?.shopOrder?.shopOrderItems?.length === 1 ? "item" : "items"}</p>
              <p className='text-[#ff4d2d]'><span className='font-semibold text-xl]'>Total Amount :- </span>₹{currentOrder?.shopOrder?.subTotal}</p>

              <div className="user-details-div">
                <h1 className='text-xl font-bold p-4 flex items-center gap-2'>👤 User details</h1>
                <p className='text-lg text-gray-600 mt-1'><span className='font-semibold text-gray-800'>Name : </span>{currentOrder?.user?.fullName}</p>
                <p className='text-lg text-gray-600 mt-1'><span className='font-semibold text-gray-800'>Email 📩 : </span>{currentOrder?.user?.email}</p>
                <p className='text-lg text-gray-600 mt-1'><span className='font-semibold text-gray-800'>Contact 📞 : </span>{currentOrder?.user?.mobile}</p>
              </div>
            </div>

            <DeliveryBoyTracking data={{
              deliveryBoyLocation: updateDeliveryBoyLocation || {
                lat: userData.location.coordinates[1],
                lon: userData.location.coordinates[0],
              },
              customerLocation: {
                lat: currentOrder.deliveryAddress.latitude,
                lon: currentOrder.deliveryAddress.longitude
              }
            }} />

            {!showOtpBox ? <button onClick={handleSendOtp} className='mt-5 w-full bg-green-500 text-white font-semibold py-2 rounded-md cursor-pointer hover:bg-green-600 transition-all active:scale-95' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "Mark as Delivered"}
            </button> : <div className='mt-5 p-4 border rounded-md bg-gray-50'>
              <p className='text-sm font-semibold mb-2'>OTP Send to <span className='text-orange-500 capitalize'>{currentOrder.user.fullName}</span></p>
              <div className="heading flex items-center gap-22 mb-5">
                <label className='block text-gray-700 font-medium'>Enter OTP</label>
                <p className='text-green-600 font-medium'>OTP :- {serverOtp}</p>
              </div>
              <div className="all-inputs-container flex gap-1">
                <input
                  type="number" 
                  required
                  ref={firstRef}
                  value={firstOtp}
                  onChange={(e) => handleInput(e, setFirstOtp, secondRef)}
                  className='w-15 h-15 border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
                />
                <input
                  type="number" 
                  required
                  ref={secondRef}
                  value={secondOtp}
                  onChange={(e) => handleInput(e, setSecondOtp, thirdRef)}
                  onKeyDown={(e) => handleKeyDown(e, setSecondOtp, firstRef)}
                  className='w-15 h-15 border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
                />
                <input
                  type="number" 
                  required
                  ref={thirdRef}
                  value={thirdOtp}
                  onChange={(e) => handleInput(e, setThirdOtp, forthRef)}
                  onKeyDown={(e) => handleKeyDown(e, setThirdOtp, secondRef)}
                  className='w-15 h-15 border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
                />
                <input
                  type="number" 
                  required
                  ref={forthRef}
                  value={forthOtp}
                  onChange={(e) => handleInput(e, setForthOtp, null)}
                  onKeyDown={(e) => handleKeyDown(e, setForthOtp, thirdRef)}
                  className='w-15 h-15 border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
                />
              </div>
              <button onClick={handleSubmitOTP} className=' w-full bg-green-500 text-white font-semibold py-2 rounded-md cursor-pointer hover:bg-green-600 transition-all active:scale-95 uppercase mt-5'>Submit otp</button>
            </div>}

          </div>
        }  
        
      </main>
    </>
  )
}

export default DeliveryBoyHome;