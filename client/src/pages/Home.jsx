import React, { useState } from 'react';
import { Bot, Globe, TrendingUp, Sprout, ChevronRight, Hourglass,Tractor } from 'lucide-react';
import TamilBot from "./TamilBot"
import EnglishBot from "./EnglishBot"
import Price from "./Price"
import Crop from "./Crop"
import Soil from "./Soil"

const AgriDashboard = () => {
  const [activePage, setActivePage] = useState('agriTamilBot');
  
  const primaryMenuItems = [
    { id: 'agriTamilBot', name: 'Agri Tamil Bot', icon: <Bot size={20} />, path: '/tamil' },
    { id: 'agriEnglishBot', name: 'Agri English Bot', icon: <Globe size={20} />, path: '/english' },
    { id: 'priceSplit', name: 'Price Split', icon: <TrendingUp size={20} />, path: '/price-split' },
    { id: 'diseasesPrediction', name: 'Diseases Prediction', icon: <Sprout size={20} />, path: '/crop-prediction' },
    { id: 'cropPrediction', name: 'Crop Prediction', icon: <Tractor size={20} />, path: '/soil-prediction' },
    { id: 'selfLife', name: 'Self Life', icon: <Hourglass size={20} />, path: '/self-life' },


  ];
  
  
  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    console.log(`Navigating to ${pageId}`);
  };
  
  const renderContent = () => {
    switch (activePage) {
      case 'agriTamilBot':
        localStorage.setItem('language', 'tamil');
        return <TamilContent />;
      case 'agriEnglishBot':
        localStorage.setItem('language', 'english');
        return <EnglishContent />;
      case 'priceSplit':
        return <PriceSplitContent />;
      case 'diseasesPrediction':
        return <CropPredictionContent />;
      case 'cropPrediction':
        return <SoilPredictionContent/>;
      case 'selfLife':
        return <SelfLife/>;
      default:
        localStorage.setItem('language', 'tamil');
        return <TamilContent />;
    }
  };
  
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Premium Sidebar */}
      <div className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Sprout size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AgriTech AI</h1>
              <p className="text-xs text-slate-400">Intelligent Farming Platform</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 px-4">
          <div className="mb-2 px-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Services</p>
          </div>
          
          {primaryMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`flex items-center justify-between w-full px-4 py-3 mb-1 rounded-xl transition-all duration-200 ${
                activePage === item.id
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-700/20'
                  : 'text-slate-300 hover:bg-slate-700/40'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 mr-3 rounded-lg flex items-center justify-center ${
                  activePage === item.id ? 'bg-white/20' : 'bg-slate-700'
                }`}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <ChevronRight size={16} className={activePage === item.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

// Page Components
const TamilContent = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
     <TamilBot/>
    </div>
  </div>
);

const EnglishContent = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <EnglishBot/>
    </div>
  </div>
);

const PriceSplitContent = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <Price/>
    </div>
  </div>
);

const CropPredictionContent = () => (
  <div className="p-8">
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
      <Crop/>
    </div>
  </div>
);


const SoilPredictionContent = () => (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <Soil/>
      </div>
    </div>
  );

  const SelfLife = () => (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl">
        <Soil/>
      </div>
    </div>
  );
  

export default AgriDashboard;