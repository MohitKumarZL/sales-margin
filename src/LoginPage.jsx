import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, loginFailure, recordSale } from './redux/authSlice';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    role: "",
  });

  const [profitReceivers, setProfitReceivers] = useState([]);
  const [showProfitDistribution, setShowProfitDistribution] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, error, sales } = useSelector(state => state.auth);

  // Role hierarchy (highest to lowest)
  const rolesHierarchy = [
    "role10",
    "role9", 
    "role8",
    "role7",
    "role6",
    "role5",
    "role4",
    "role3",
    "role2",
    "role1"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
      role: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Please select a role";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calculateProfitDistribution = (role) => {
    const currentRoleIndex = rolesHierarchy.indexOf(role);
    if (currentRoleIndex <= 0) return []; // No roles above
    
    const superiorRoles = rolesHierarchy.slice(0, currentRoleIndex);
    const profitPerRole = (3000 * 0.25) / superiorRoles.length;
    
    return superiorRoles.map(r => ({
      role: r,
      amount: profitPerRole
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if role has already sold an item
    if (sales.some(sale => sale.role === formData.role)) {
      dispatch(loginFailure("This role has already sold an item today"));
      alert("This role can only sell one item per day");
      return;
    }

    const user = users.find(u => 
      u.username === formData.username && 
      u.password === formData.password && 
      u.role === formData.role
    );

    if (user) {
      // Calculate profit distribution
      const distribution = calculateProfitDistribution(formData.role);
      setProfitReceivers(distribution);
      setShowProfitDistribution(true);
      
      // Record the sale for this role
      dispatch(recordSale({ role: formData.role }));
      
      // Login successful
      dispatch(loginSuccess(user));
      
      // Redirect after showing distribution
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } else {
      dispatch(loginFailure("Invalid username, password, or role"));
      alert("Invalid username, password, or role. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-gray-400 p-8 shadow-xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login
        </h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-500 p-2 text-white text-center">
            {error}
          </div>
        )}

        {showProfitDistribution && (
          <div className="mb-4 rounded bg-green-100 p-4 border border-green-300">
            <h3 className="font-bold text-green-800 mb-2">Profit Distribution</h3>
            {profitReceivers.length > 0 ? (
              <ul className="space-y-1">
                {profitReceivers.map((receiver, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{receiver.role}:</span>
                    <span>${receiver.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No profit distribution - this is the highest role</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username*</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-2 focus:outline-none ${
                errors.username ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-2 focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role*</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-2 focus:outline-none ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="" disabled>Select a role</option>
              {rolesHierarchy.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700"
          >
            Log In
          </button>
        </form>
        <div className="mt-4 flex justify-between px-2 py-2 text-gray-800">
          <span>Don't have an account?</span>
          <Link 
            to="/signup" 
            className="font-medium text-blue-700 hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}