import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Bread from "./assets/bread.jpg";

const Home = () => {
  const { currentUser } = useSelector(state => state.auth);
  const [items, setItems] = useState([
    { id: 1, name: 'Artisan Bread', price: 4500, quantity: 1 }
  ]);
  const [profitDistribution, setProfitDistribution] = useState([]);
  const [showDistribution, setShowDistribution] = useState(false);

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

  const handleSell = (itemId) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId && item.quantity > 0) {
          //  profit and distribution
          const totalProfit = item.price * 0.25;
          const distribution = calculateProfitDistribution(totalProfit);

          setProfitDistribution(distribution);
          setShowDistribution(true);

          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      })
    );
  };

  const calculateProfitDistribution = (totalProfit) => {
    const currentRoleIndex = rolesHierarchy.indexOf(currentUser.role);

    if (currentRoleIndex === -1) return [];
    if (currentRoleIndex === 0) return []; // No roles above

    // Get only roles above current role
    const superiorRoles = rolesHierarchy.slice(0, currentRoleIndex);
    const share = totalProfit / superiorRoles.length;

    return superiorRoles.map(role => ({
      role,
      amount: share,
      receiver: `Role ${role.substring(4)}` // Convert "role10" to "Role 10"
    }));
  };

  return (
    <div className='grid grid-cols-2 max-h-screen'>
      <div className=' p-4'>
        <img src={Bread} alt="Artisan Bread" className='w-full h-64 object-contain mb-4' />
        <div className='mb-4'>
          <h3 className='text-xl font-bold'>{items[0].name}</h3>
          <p className='text-lg'>Price: ${items[0].price}</p>
          <p className='text-lg'>Available: {items[0].quantity}</p>
        </div>
        <div className='flex justify-center'>        <button
          onClick={() => handleSell(items[0].id)}
          disabled={items[0].quantity === 0}
          className={`px-20 rounded-md py-2 text-white transition  ${items[0].quantity === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {items[0].quantity === 0 ? 'Sold Out' : 'Sell'}
        </button>
        </div>

      </div>

      <div className='pt-10 px-10'>
        <p className='text-2xl font-bold mb-4'>Congratulations</p>
        <div>Mr/Mrs {currentUser?.username.charAt(0).toUpperCase() + currentUser?.username.slice(1).toLowerCase()}</div>

        <div className='mb-4'>
          <p className='font-semibold'>Your Role:
            <span className='text-blue-600 ml-2'>
              {currentUser?.role.replace('role', 'Role ')}
            </span>
          </p>
        </div>

        {showDistribution && profitDistribution.length > 0 && (
          <div className='bg-green-50 border border-green-200 p-4 rounded-lg mb-4'>
            <h4 className='font-bold text-green-800 mb-2'>Profit Distributed:</h4>
            <p className='mb-2'>Total Profit: ${(items[0].price * 0.25).toFixed(2)}</p>
            <ul className='space-y-1'>
              {profitDistribution.map((receiver, index) => (
                <li key={index} className='flex justify-between'>
                  <span>{receiver.receiver}:</span>
                  <span>${receiver.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showDistribution && profitDistribution.length === 0 && (
          <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4'>
            <p className='text-yellow-800'>No superior roles to distribute profit to.</p>
            <p className='font-semibold mt-1'>You keep the full profit!</p>
          </div>
        )}


      </div>
    </div>
  );
};

export default Home;