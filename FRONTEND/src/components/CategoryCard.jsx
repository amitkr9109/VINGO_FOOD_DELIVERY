import React from 'react'

const CategoryCard = ({ data, onClick }) => {
  return (
    <>
      <div className="main">
        <div onClick={onClick} className='w-[150px] h-[140px] md:w-[180px] md:h-[180px] rounded-md border-2 border-[#ff4d2d] shrink-0 bg-white overflow-hidden shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow relative cursor-pointer active:scale-95'>
          <img src={data?.image} alt="" className='absolute inset-0 w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />
          <div className="absolute bottom-0 left-0 w-full bg-[#ffffff96] bg-opacity-95 px-3 py-1 rounded-t-md text-center shadow text-sm font-medium backdrop:blur text-gray-800">{data?.category}</div>
        </div>
      </div>
    </>
  )
}

export default CategoryCard;
