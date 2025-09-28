import React from 'react'
import { useNavigate} from 'react-router-dom'

const ShopCard = ({ data }) => {

  const navigate = useNavigate();

  return (
    <>
      <div className="main">
        <div onClick={() => navigate(`/user-allshop-find/${data._id}`)} className='w-[150px] h-[140px] md:w-[180px] md:h-[180px] rounded-md border-2 border-[#ff4d2d] shrink-0 bg-white overflow-hidden shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative cursor-pointer active:scale-95'>
          <img src={data?.image} alt="" className='absolute inset-0 w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />
          <h1 className="absolute bottom-0 left-0 w-full bg-[#ffffff96] bg-opacity-95 px-3 py-1 rounded-t-md text-center shadow text-sm font-medium backdrop:blur text-gray-800 capitalize">{data?.name}</h1>
        </div>
      </div>
    </>
  )
}

export default ShopCard
