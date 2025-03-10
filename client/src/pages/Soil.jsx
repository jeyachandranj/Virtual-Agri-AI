import React, { useState, useEffect, useRef } from 'react';

const CommodityPredictionApp = () => {
  const DISTRICT_CODES = {
    '1': 'Coimbatore', 
    '12': 'Dharmapuri', 
    '13': 'Dindigul', 
    '3': 'Erode', 
    '33': 'Kallakuruchi', 
    '4': 'Kancheepuram', 
    '14': 'Karur', 
    '31': 'Krishnagiri', 
    '5': 'Madurai', 
    '38': 'Mayiladuthurai', 
    '16': 'Nagapattinam', 
    '17': 'Nagercoil (Kannyiakumari)', 
    '18': 'Namakkal', 
    '6': 'Perambalur', 
    '20': 'Pudukkottai', 
    '21': 'Ramanathapuram', 
    '34': 'Ranipet', 
    '22': 'Salem', 
    '23': 'Sivaganga', 
    '35': 'Tenkasi', 
    '7': 'Thanjavur', 
    '19': 'The Nilgiris', 
    '24': 'Theni', 
    '25': 'Thiruchirappalli', 
    '26': 'Thirunelveli', 
    '36': 'Thirupathur', 
    '37': 'Thirupur', 
    '8': 'Thiruvannamalai', 
    '9': 'Thiruvarur', 
    '27': 'Thiruvellore', 
    '28': 'Tuticorin', 
    '29': 'Vellore', 
    '10': 'Villupuram', 
    '11': 'Virudhunagar'
  };
  
  const [district, setDistrict] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Sort districts alphabetically for better user experience
  const sortedDistricts = Object.entries(DISTRICT_CODES)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter districts based on search term
  const filteredDistricts = sortedDistricts.filter(
    district => district.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectDistrict = (name, code) => {
    setDistrict(name);
    setDistrictCode(code);
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!district) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Using both district name and code for more robust API calls
      const response = await fetch(`http://192.168.41.170:5000/predict?district=${encodeURIComponent(district)}&district_code=${districtCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }
      
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError('Error fetching predictions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Color palette for commodity cards
  const colors = [
    { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800' },
    { bg: '#10947c', border: 'border-blue-500', text: 'text-blue-800' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 p-6" style={{height:"150px"}}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden" style={{height:"620px"}}>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white ">
          <h1 className="text-3xl font-bold mb-2">AgriProfit Predictor</h1>
          <p className="text-green-100">Discover the most profitable crops for your region</p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative" ref={dropdownRef}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    if (e.target.value === '') {
                      setDistrict('');
                      setDistrictCode('');
                    }
                  }}
                  onClick={() => setShowDropdown(true)}
                  placeholder="Search and select district"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                  required
                />
                
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((item) => (
                        <div
                          key={item.code}
                          className="p-3 hover:bg-green-50 cursor-pointer transition-colors duration-150 border-b border-gray-100"
                          onClick={() => handleSelectDistrict(item.name, item.code)}
                        >
                          {item.name}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-gray-500">No districts found</div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center" style={{backgroundColor:"#10947c"}}
                disabled={loading || !district}
              >
                {loading ? 'Predicting...' : 'Predict Profits'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {predictions && (
            <div className="animate-fadeIn">
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-blue-800 mb-1">
                  Profit Predictions for {predictions.district}
                </h2>
                <p className="text-blue-600">
                  Here are the top commodities predicted to be most profitable in your region
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {predictions.top_commodities.map((item, index) => (
                  <div
                    key={index}
                    className={`${colors[index % colors.length].bg} ${colors[index % colors.length].border} border-l-4 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-1 transition-transform`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${colors[index % colors.length].text}`}>
                        {item.commodity}
                      </h3>
                      {index === 0 && (
                        <span className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
                          TOP CHOICE
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-500 text-sm mb-1">Expected Profit</p>
                      <p className="text-3xl font-bold text-gray-800">₹{item.expected_profit.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 mt-4">per quintal</p>
                    </div>
                  </div>
                ))}
              </div>

             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommodityPredictionApp;