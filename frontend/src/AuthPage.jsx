import { useState } from "react";
import api from "./api/api";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Method to handle login request (Keep empty/ready for your logic)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const data = { email: formData.email, password: formData.password };

    const res = await api.post("/auth/login", data);

    if (res.data.success) {
      navigate("/" + res.data.data.role);
    }
  };

  // Method to handle register request (Keep empty/ready for your logic)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/register", formData);

    console.log(res);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md border border-gray-200'>
        {/* Header Title */}
        <div>
          <h2 className='text-center text-3xl font-extrabold text-gray-900'>
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: "", email: "", password: "" }); // Reset form on switch
              }}
              className='font-medium text-blue-600 hover:text-blue-500 focus:outline-none'
            >
              {isLogin ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Form */}
        <form
          className='mt-8 space-y-6'
          onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
        >
          <div className='space-y-4 rounded-md shadow-sm'>
            {/* Name Field (Only for Register) */}
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium text-gray-700'>Full Name</label>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='John Doe'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Email Address</label>
              <input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleChange}
                placeholder='you@example.com'
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              />
            </div>

            {/* Password Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700'>Password</label>
              <input
                id='password'
                name='password'
                type='password'
                required
                value={formData.password}
                onChange={handleChange}
                placeholder='••••••••'
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type='submit'
              className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
            >
              {isLogin ? "Sign In" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
