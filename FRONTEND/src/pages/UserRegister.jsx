import React, { useState } from 'react'
import { FcGoogle } from "react-icons/fc"
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../utils/firebase'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'


const UserRegister = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const submitHandler = async () => {

    setError("");
    const newData = {
      fullName,
      email,
      role,
      password,
      mobile: mobileNo,
    }

    try {
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newData, {withCredentials: true});
    
        const data = response.data;
        dispatch(setUserData(data.user));
        
        navigate("/home");
        toast.success("Register successfully !");
     
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
    }

    setFullName("");
    setEmail("");
    setMobileNo("");
    setPassword("");
  }


  const handleGoogleAuth = async () => {
    setError("");
    if(!mobileNo) {
      toast.error("Mobile no is requird");
      return;
    }
    if (mobileNo.length !== 10) {
      toast.error("Mobile no must be 10 digits");
      return;
    }
    if (!role) {
      toast.error("Role is required");
      return;
    }
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const newData = {
      fullName: result.user.displayName,
      email: result.user.email,
      mobile: mobileNo,
      role
    }
    
    try {  
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/google-register`, newData, { withCredentials: true });
      dispatch(setUserData(response.data));
      navigate("/home");
      toast.success("Register successfully by google");
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
    }
  }

  return (
    <>
      <main className='w-full min-h-screen flex items-center justify-center p-4 bg-[#fff9f6]'>
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-5 border-[1px] border-[#ddd]">
          <h1 className='text-2xl font-bold text-[#ff4d2d]'>Vingo</h1>
          <p className='font-medium text-gray-500 mt-2 leading-tight'>Create your account to get started with delicious food deliveries.</p>
          <div className="all-input-fields flex flex-col gap-2">
            <div className="mt-2 name">
              <label className='block text-gray-700 font-medium mb-1'>Full name</label>
              <input
              type="text" 
              placeholder='Enter full name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
            </div>
            <div className='email'>
              <label className='block text-gray-700 font-medium mb-1'>Email</label>
              <input
              type="email" 
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
            </div>
            <div className='phone-number'>
              <label className='block text-gray-700 font-medium mb-1'>Mobile No.</label>
              <input
              type="number" 
              placeholder='Enter phone number'
              value={mobileNo}
              onChange={(e) => setMobileNo(e.target.value)}
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
            </div>
            <div className='role-div'>
              <label className='block text-gray-700 font-medium mb-1'>Role</label>
              <div className="flex items-center gap-3">
                {["user", "owner", "deliveryboy"].map((r, idx) => (
                  <button
                    key={idx} 
                    onClick={() => setRole(r)}
                    className={`flex-1 px-3 py-2 border border-[#ddd] rounded-md cursor-pointer active:scale-95 transition-colors ${role == r ? "bg-[#ff4d2d] text-white" : "border border-[#000]"}`}>{r}
                  </button>
                )) }
              </div>
            </div>
            {error.length > 0 && (
              <div className='text-red-500 text-center text-sm'>
                {error.map((errmsg, idx) => (
                  <div key={idx}>{errmsg}</div>
                ))}
              </div>
            )}
            <button onClick={() => submitHandler()} className='bg-[#ff4d2d] text-white uppercase py-2 rounded-md cursor-pointer active:scale-95 mt-5 transition-all hover:bg-[#e64323]'>sign up</button>
          </div>
          <div className="line-container flex items-center mt-2 mb-2">
            <div className="line1 w-[35vw] h-[0.5px] bg-black"></div>
              <div className="middle px-2 py-0.5 border border-black rounded-md">OR</div>
            <div className="line2 w-[35vw] h-[0.5px] bg-black"></div>
          </div>
          <button onClick={handleGoogleAuth} className='border border-gray-200 py-2 rounded-md cursor-pointer active:scale-95 w-full flex items-center justify-center gap-5 transition-all hover:bg-gray-200'><FcGoogle /> Sign Up with Google</button>
          <p className='font-medium text-lg opacity-75'>
            Already have an account?   
            <Link to="/"><span className='text-blue-700 underline active:scale-95 text-lg'> Log in</span></Link>
          </p>
        </div>
      </main>
    </>
  )
}

export default UserRegister;
