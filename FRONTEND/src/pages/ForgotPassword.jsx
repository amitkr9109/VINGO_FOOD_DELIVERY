import axios from 'axios';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const ForgotPassword = () => {

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const [firstOtp, setFirstOtp] = useState("");
  const [secondOtp, setSecondOtp] = useState("");
  const [thirdOtp, setThirdOtp] = useState("");
  const [forthOtp, setForthOtp] = useState("");

  const firstRef = useRef(null);
  const secondRef = useRef(null);
  const thirdRef = useRef(null);
  const forthRef = useRef(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInput = (e, setValue, nextRef) => {
    const val = e.target.value;
    if(/^[0-9]?$/.test(val)) {
      setValue(val);
      if(val && nextRef) {
        nextRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e, setValue, prevRef) => {
    if(e.key === "Backspace" && !e.target.value && prevRef) {
      prevRef.current.focus();
      setValue("");
    }
  }


  const submitSendOTPHandler = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/send-otp`, { email }, { withCredentials: true });
      toast.success("OTP sent successfully");
      setServerOtp(response.data.generateOtp);
      setStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Something went wrong";

      if (errorMsg.includes("User does not exists")) {
        toast.error("No account found with this email. Please register first.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };



  const verifyOTPHandler = async () => {

    if(!firstOtp || !secondOtp || !thirdOtp || !forthOtp) {
      toast.error("All fields are required");
      return;
    }

    const otp = firstOtp + secondOtp + thirdOtp + forthOtp;
    const newData = {
      email,
      otp
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/verify-otp`, newData);
      if(response.status === 200) {
        const data = response.data;
        localStorage.setItem("token", data.token);
        toast.success("OTP verify successfully");
        setStep(3);
      }

      setFirstOtp("");
      setSecondOtp("");
      setThirdOtp("");
      setForthOtp("");
      firstRef.current.focus();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  const resetPasswordHandler = async () => {
    if(newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const newData = {
      email,
      password: newPassword
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/reset-password`, newData, {withCredentials: true});
      toast.success("password reset successfully");
      navigate("/");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <main className='w-full min-h-screen p-4 flex items-center justify-center bg-[#fff9f6]'>
        <div className="bg-white w-full max-w-md rounded-md shadow-lg p-5 border-[1px] border-[#ddd]">
          <div className="icon flex items-center gap-5 text-[#ff4d2d]">
            <i onClick={() => navigate("/")} className="ri-arrow-left-line font-semibold text-xl cursor-pointer active:scale-95"></i>
            <h1 className='font-semibold text-lg'>Forgot Password</h1>
          </div>
          {step == 1 && 
            <div className='email mt-5'>
              <label className='block text-gray-700 font-medium mb-1'>Email</label>
              <input
                type="email" 
                required
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
              <button onClick={submitSendOTPHandler} className='bg-[#ff4d2d] text-white uppercase w-full py-2 rounded-md cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] mt-5' disabled={loading}>
                {loading ? <ClipLoader size={20} color='white' /> : "send otp"}
              </button>
            </div> 
          }
          {step == 2 && 
            <div className='otp mt-2'>
              {serverOtp && (
                <p className='text-green-600 font-medium'>OTP :- {serverOtp}</p>
              )}
              <label className='block text-gray-700 font-medium mb-5'>Enter OTP</label>
              <div className="all-inputs-container flex justify-between">
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
              <button onClick={verifyOTPHandler} className='bg-[#ff4d2d] text-white uppercase w-full py-2 rounded-md cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] mt-5'>verify otp</button>
            </div> 
          }
          {step == 3 && 
            <div className='password mt-5'>
              <label className='block text-gray-700 font-medium mb-1'>New password</label>
              <input
                type="password" 
                placeholder='Enter new password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
              <label className='block text-gray-700 font-medium mb-1 mt-5'>Confirm password</label>
              <input
                type="password" 
                placeholder='confirm password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full border border-[#ddd] rounded-md px-3 py-2 focus:outline-orange-200'
              />
              <button onClick={resetPasswordHandler} className='bg-[#ff4d2d] text-white uppercase w-full py-2 rounded-md cursor-pointer active:scale-95 transition-all hover:bg-[#e64323] mt-5'>reset password</button>
            </div> 
          }
        </div>
      </main>
    </>
  )
}

export default ForgotPassword;