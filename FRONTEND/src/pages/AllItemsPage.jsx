import React from 'react'
import { useSelector } from "react-redux"
import { useNavigate, useParams } from 'react-router-dom';
import AllItemsCard from '../components/AllItemsCard';

const AllItemsPage = () => {

  const { id } = useParams();

  const { myShopData } = useSelector(state => state.owner);

  const shopdetails = myShopData.find(shop => shop._id === id);

  const navigate = useNavigate();


  return (
    <>
      <main className='w-full min-h-screen flex flex-col items-center bg-[#fff9f6]'>
        <div className="w-full max-w-2xl add-item-button p-5 flex items-center justify-between">
            <div className="icon-div">
              <i onClick={() => navigate("/home")} className="ri-arrow-left-long-line text-2xl cursor-pointer active:scale-95"></i>
            </div>
            <div className="btn-div">
                <button onClick={() => navigate(`/add-item/${shopdetails?._id}`)} className="hidden md:flex items-center text-center gap-2 bg-[#ff4d2d]/10 text-[#ff4d2d] px-4 py-0.5 rounded-md text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]/15">
                    <i className="ri-add-fill text-xl"></i>
                    <span className='md:block hidden outline-none font-medium'>Add Food Item</span>
                </button>
                <button onClick={() => navigate(`/add-item/${shopdetails?._id}`)} className="md:hidden flex items-center text-center gap-2 bg-[#ff4d2d]/10 text-[#ff4d2d] px-2 py-1 rounded-full text-sm cursor-pointer active:scale-95 transition-all hover:bg-[#e64323]/15">
                    <i className="ri-add-fill text-xl"></i>
                </button>
            </div>
        </div>

        {shopdetails && (
          <div className="mt-5 mb-10 w-full flex flex-col items-center gap-5 px-4">
            {shopdetails.items.length > 0 ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
                {shopdetails.items.map((item, idx) => (
                  <AllItemsCard key={idx} data={item} />
                ))}
              </div>
            ) : (
              <p className='font-medium'>No items added yet for this shop.</p>
            )}
          </div>
        )}
        
      </main>
    </>
  )
}

export default AllItemsPage;


