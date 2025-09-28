import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from "react-redux"
import UserNav from './UserNav';
import { categories } from '../category';
import CategoryCard from './CategoryCard';
import ShopCard from './ShopCard';
import ItemCard from './ItemCard';
import { setItemsInMyCity, setShopInMyCity } from '../redux/userSlice';


const UserHome = () => {

  const { currentCity, shopInMyCity, itemsInMyCity, searchItems, socket } = useSelector(state => state.user);
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();

  const dispatch = useDispatch();

  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsFilteredList, setUpdatedItemsFilteredList] = useState([]);

  const scrollHandler = (ref, direction) => {
    if(ref.current) {
      ref.current.scrollBy({
        left: direction == "left" ? -200 : 200,
        behavior: "smooth"
      })
    }
  }

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if(element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth);
    }
  }

  useEffect(() => {
    if(cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

      cateScrollRef.current.addEventListener("scroll", () => {
        updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
      })

      shopScrollRef.current.addEventListener("scroll", () => {
        updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);
      })
    }
  }, []);


  const handleFilteredByCategory = (category) => {
    if(category == "All") {
      setUpdatedItemsFilteredList(itemsInMyCity);
    }
    else{
      const filteredList = itemsInMyCity.filter(item => item.category === category);
      setUpdatedItemsFilteredList(filteredList);
    }
  }

  useEffect(() => {
    setUpdatedItemsFilteredList(itemsInMyCity)
  }, [itemsInMyCity]);

  useEffect(() => {
    socket?.on("newShop", (shop) => {
      if(shop.city.toLowerCase() === currentCity.toLowerCase()) {
        dispatch(setShopInMyCity([shop, ...shopInMyCity]));
      }
    });

    socket?.on("editShop", (shop) => {
      if(shop.city.toLowerCase() === currentCity.toLowerCase()) {
        const updatedShops = shopInMyCity.map(s => s._id === shop._id ? shop : s);
        dispatch(setShopInMyCity(updatedShops));
      }
    });

    socket?.on("deleteShop", (shopId) => {
      const deletedShops = shopInMyCity.filter(s => s._id !== shopId);
      dispatch(setShopInMyCity(deletedShops));
    });

    return () => {
      socket?.off("newShop");
      socket?.off("editShop");
      socket?.off("deleteShop");
    }
  }, [socket, currentCity, shopInMyCity]);

  useEffect(() => {
    socket?.on("newItem", (item) => {
      if(item.shop.city.toLowerCase() === currentCity.toLowerCase()) {
        dispatch(setItemsInMyCity([item, ...itemsInMyCity]));
      }
    });

    socket.on("editItem", (item) => {
      if(item.shop.city.toLowerCase() === currentCity.toLowerCase()) {
        const updatedItems = itemsInMyCity.map(i => i._id === item._id ? item : i);
        dispatch(setItemsInMyCity(updatedItems));
      }
    });

    socket.on("deleteItem", (itemId) => {
      const updatedItems = itemsInMyCity.filter(i => i._id !== itemId);
      dispatch(setItemsInMyCity(updatedItems));
    });

    return () => {
      socket?.off("newItem");
      socket?.off("editItem");
      socket?.off("deleteItem");
    }

  }, [socket, currentCity, itemsInMyCity, dispatch]);

  return (
    <>
      <main className='w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] overflow-y-auto'>
        <UserNav />

        {searchItems && searchItems.length > 0 && (
          <div className="max-w-6xl w-[90vw] flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-md md:mt-22 mt-40">
            <h1 className='text-gray-900 text-2xl font-semibold pb-2'>Search Results</h1>
            <div className="w-full h-auto flex flex-wrap gap-10 justify-center">
              {searchItems.map((item, idx) => (
                <ItemCard key={idx} data={item} />
              ))}
            </div>
          </div>
        )}

        <div className="all-category-div w-full max-w-5xl flex flex-col items-start p-5 gap-5 pt-25">
          <h1 className='text-gray-800 text-2xl'>Inspiration for your first order</h1>
          <div className="w-full relative">
            {showLeftCateButton && 
              <button onClick={
                () => scrollHandler(cateScrollRef, "left")
              } className='absolute z-10 left-0 top-1/2 md:left-0.5 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full px-2 py-1 shadow-lg hover:bg-[#e64528] cursor-pointer active:scale-95'><i className="ri-arrow-left-s-line"></i></button>
            }
            <div className="w-full flex overflow-x-auto gap-5 pb-2" ref={cateScrollRef}>
              {categories.map((cate, idx) => (
                <CategoryCard key={idx} data={cate} onClick={() => handleFilteredByCategory(cate.category)} />
              ))}
            </div>
            {showRightCateButton && 
              <button onClick={
                () => scrollHandler(cateScrollRef, "right")
              } className='absolute z-10 right-0 top-1/2 md:right-0.5 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full px-2 py-1 shadow-lg hover:bg-[#e64528] cursor-pointer active:scale-95'><i className="ri-arrow-right-s-line"></i></button>
            }
          </div>
        </div>

        <div className="all-shops-div w-full max-w-5xl flex flex-col items-start md:p-5 px-5 gap-5">
          <h1 className='text-gray-800 text-2xl'>Best Shops in {currentCity}</h1>
          <div className="w-full relative">
            {showLeftShopButton && 
              <button onClick={
                () => scrollHandler(shopScrollRef, "left")
              } className='absolute z-10 left-0 top-1/2 md:left-0.5 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full px-2 py-1 shadow-lg hover:bg-[#e64528] cursor-pointer active:scale-95'><i className="ri-arrow-left-s-line"></i></button>
            }
            <div className="w-full flex overflow-x-auto gap-5 pb-2" ref={shopScrollRef}>
              {shopInMyCity.map((shop, idx) => (
                <ShopCard key={idx} data={shop} />
              ))}
            </div>
            {showRightShopButton && 
              <button onClick={
                () => scrollHandler(shopScrollRef, "right")
              } className='absolute z-10 right-0 top-1/2 md:right-0.5 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full px-2 py-1 shadow-lg hover:bg-[#e64528] cursor-pointer active:scale-95'><i className="ri-arrow-right-s-line"></i></button>
            }
          </div>
        </div>

        <div className="all-items-div w-full max-w-5xl flex flex-col items-start md:p-5 px-5 py-2 gap-5">
          <h1 className='text-gray-800 text-2xl'>Suggested Food Items</h1>
          <div className="w-full h-auto flex flex-wrap justify-center gap-5">
            {updatedItemsFilteredList?.map((item, idx) => (
              <ItemCard key={idx} data={item} />
            ))}
          </div>
        </div>

      </main>
    </>
  )
}

export default UserHome;

