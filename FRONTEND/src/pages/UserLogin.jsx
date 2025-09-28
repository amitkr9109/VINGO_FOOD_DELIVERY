import axios from 'axios';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { auth } from '../../utils/firebase';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';


const UserLogin = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();


  const submitHandler = async () => {
    setLoading(true)
    setError("");
    const newData = {
      email,
      password
    }

    try {
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, newData, {withCredentials: true});

      const data = response.data;
      dispatch(setUserData(data.user))
    
      navigate("/home");
      toast.success("Login successfully !");
      

      setEmail("");
      setPassword("");

    } catch (err) {
      if(err.response && err.response.data) {
        if(Array.isArray(err.response.data.errors)) {
          const validationMessages = err.response.data.errors.map(user => user.msg);
          setError(validationMessages);
          validationMessages.forEach(msg => toast.error(msg));
        }
        else if(err.response.data.message) {
          setError([err.response.data.message]);
          toast.error(err.response.data.message);
        }
        else {
          setError(["Something went wrong"]);
          toast.err(["Something went wrong"]);
        }
      }
      else {
        setError(["Server not responding"]);
        toast.err(["Server not responding"]);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleAuth = async () => {
    setLoading(true)
    setError("");
    const provider = new GoogleAuthProvider();
  
    const result = await signInWithPopup(auth, provider);
  
    const newData = {
      email: result.user.email,
    }
      
    try {  
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/google-login`, newData, { withCredentials: true });
      dispatch(setUserData(response.data));
      navigate("/home");
      toast.success("Login successfully by google");
    } catch (err) {
      if(err.response && err.response.data) {
        if(Array.isArray(err.response.data.errors)) {
          const validationMessages = err.response.data.errors.map(user => user.msg);
          setError(validationMessages);
          validationMessages.forEach(msg => toast.error(msg));
        }
        else if(err.response.data.message) {
          setError([err.response.data.message]);
          toast.error(err.response.data.message);
        }
        else{
          setError(["Something went wrong"]);
          toast.error("Something went wrong");
        }
      }
      else{
        setError(["Server not responding"]);
        toast.error("Server not responding");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className='w-full min-h-screen flex items-center justify-center p-4 bg-[#fff9f6]'>
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-5 border-[1px] border-[#ddd]">
          <h1 className='text-2xl font-bold text-[#ff4d2d]'>Vingo</h1>
          <p className='font-medium text-gray-500 mt-2 leading-tight'>Login account to get started with delicious food deliveries.</p>
          <div className="all-input-fields flex flex-col gap-2">
            <div className='email mt-5'>
              <label className='block text-gray-700 font-medium mb-1'>Email</label>
              <input
                type="email" 
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
            </div>
            <div className='password'>
              <label className='block text-gray-700 font-medium mb-1'>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} 
                  placeholder='Enter Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full border border-[#ddd] rounded-md px-3 py-2 pr-[5.5px] focus:outline-orange-200'
                />
                <button className='absolute right-3 top-[10px] cursor-pointer' onClick={() => 
                  setShowPassword(prev => !prev)
                }>{!showPassword ? (<i className="ri-eye-fill"></i>) : (<i className="ri-eye-off-fill"></i>)}</button>
              </div>
              <div className="text-right mt-2">
                <Link to="/forgot-password" className='text-[#ff4d2d] cursor-pointer active:scale-95'>Forgot password</Link>
              </div>
            </div>
            {error.length > 0 && (
              <div className='text-red-500 text-center text-sm mt-2'>
                {error.map((errmsg, idx) => (
                  <div key={idx}>{errmsg}</div>
                ))}
              </div>
            )}
            <button onClick={() => submitHandler()} className='bg-[#ff4d2d] text-white uppercase py-2 rounded-md cursor-pointer active:scale-95 mt-[20vh] transition-all hover:bg-[#e64323]' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "log in"}
            </button>
            <div className="line-container flex items-center mt-4 mb-2">
              <div className="line1 w-[35vw] h-[0.5px] bg-black"></div>
               <div className="middle px-2 py-0.5 border border-black rounded-md">OR</div>
              <div className="line2 w-[35vw] h-[0.5px] bg-black"></div>
            </div>
            <button onClick={handleGoogleAuth} className='border border-gray-200 py-2 rounded-md cursor-pointer active:scale-95 flex items-center justify-center gap-5 transition-all hover:bg-gray-200' disabled={loading}><FcGoogle />
              {loading ? <ClipLoader size={20} color='white' /> : "Sign in with Google"}
            </button>
            <p className='font-medium text-lg opacity-75 mt-2'>
              Don't have account ?
              <Link to="/user-register"><span className='text-blue-700 underline active:scale-95 text-lg'> Register Now</span></Link>
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

export default UserLogin;
