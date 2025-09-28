import LocomotiveScroll from 'locomotive-scroll';
const locomotiveScroll = new LocomotiveScroll();
import { Route, Routes } from 'react-router-dom'
import UserRegister from './pages/UserRegister'
import UserLogin from './pages/UserLogin'
import UserHome from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './ProtectedRoute/ProtectedRoute'
import UseGetCity from './hooks/UseGetCity'
import UseGetMyShop from './hooks/UseGetMyShop'
import CreateShop from './pages/CreateShop'
import UseCurrent from './hooks/UseCurrent'
import AddItem from './pages/AddItem'
import EditShop from './pages/EditShop'
import AllItemsPage from './pages/AllItemsPage'
import EditItem from './pages/EditItem'
import UseGetShopByCity from './hooks/UseGetShopByCity'
import UseGetItemsByCity from './hooks/UseGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut';
import OrderPlaced from './pages/OrderPlaced';
import MyOrders from './pages/MyOrders';
import UseGetMyOrders from './hooks/UseGetMyOrders';
import UseUpdateLocation from './hooks/UseUpdateLocation';
import UserTrackOrderPage from './pages/UserTrackOrderPage';
import UserAllShops from './pages/UserAllShops';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setSocket } from './redux/userSlice';

const App = () => {

  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch();

  UseCurrent();
  UseGetCity();
  UseGetMyShop();
  UseGetShopByCity();
  UseGetItemsByCity();
  UseGetMyOrders();
  UseUpdateLocation();

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_BASE_URL, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    
    socketInstance.on("connect", () => {
      if(userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    });

    return() => {
      socketInstance.disconnect();
    }
  }, [userData._id]);

  return (
    <Routes>
      <Route path='/' element={<UserLogin />} />
      <Route path='/user-register' element={<UserRegister />} />
      <Route path='/home' element={<ProtectedRoute> <UserHome /> </ProtectedRoute> } />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/create-shop' element={<ProtectedRoute> <CreateShop /> </ProtectedRoute>} />
      <Route path='/edit-shop/:id' element={<ProtectedRoute> <EditShop /> </ProtectedRoute>} />
      <Route path='/add-item/:id' element={<ProtectedRoute> <AddItem /> </ProtectedRoute>} />
      <Route path='/all-item/:id' element={<ProtectedRoute> <AllItemsPage /> </ProtectedRoute>} />
      <Route path='/edit-item/:id' element={<ProtectedRoute> <EditItem /> </ProtectedRoute>} />
      <Route path='/cart' element={<ProtectedRoute> <CartPage /> </ProtectedRoute>} />
      <Route path='/checkout' element={<ProtectedRoute> <CheckOut /> </ProtectedRoute>} />
      <Route path='/order-placed' element={<ProtectedRoute> <OrderPlaced /> </ProtectedRoute>} />
      <Route path='/my-orders' element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />
      <Route path='/user-track-order/:id' element={<ProtectedRoute> <UserTrackOrderPage /> </ProtectedRoute>} />
      <Route path='/user-allshop-find/:id' element={<ProtectedRoute> <UserAllShops /> </ProtectedRoute>} />
    </Routes>
  )
}

export default App;