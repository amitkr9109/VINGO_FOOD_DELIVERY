import React from 'react'
import { useSelector } from "react-redux"
import UserHome from '../components/UserHome';
import OwnerHome from '../components/OwnerHome';
import DeliveryBoyHome from '../components/DeliveryBoyHome';

const Home = () => {

  const userState = useSelector(state => state.user) || {};
  const { userData = null } = userState;

  return (
    <>
      <main className='w-full min-h-screen bg-[#fff9f6]'>
        {userData?.role == "user" && <UserHome />}
        {userData?.role == "owner" && <OwnerHome />}
        {userData?.role == "deliveryboy" && <DeliveryBoyHome />}
      </main>
    </>
  )
}

export default Home;