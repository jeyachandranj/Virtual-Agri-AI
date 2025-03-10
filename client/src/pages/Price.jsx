import React, { useState, useEffect } from 'react';
import { Search, Calendar, ArrowDown, ArrowUp, ArrowRight, Loader2, Filter } from 'lucide-react';

const MarketPriceDashboard = () => {
  // Tamil Nadu District and Commodity data
  const DISTRICT_CODES = { 
    '30': 'Ariyalur', '32': 'Chengalpattu', '15': 'Chennai', '1': 'Coimbatore', 
    '2': 'Cuddalore', '12': 'Dharmapuri', '13': 'Dindigul', '3': 'Erode', 
    '33': 'Kallakuruchi', '4': 'Kancheepuram', '14': 'Karur', '31': 'Krishnagiri', 
    '5': 'Madurai', '38': 'Mayiladuthurai', '16': 'Nagapattinam', '17': 'Nagercoil (Kannyiakumari)', 
    '18': 'Namakkal', '6': 'Perambalur', '20': 'Pudukkottai', '21': 'Ramanathapuram', 
    '34': 'Ranipet', '22': 'Salem', '23': 'Sivaganga', '35': 'Tenkasi', 
    '7': 'Thanjavur', '19': 'The Nilgiris', '24': 'Theni', '25': 'Thiruchirappalli', 
    '26': 'Thirunelveli', '36': 'Thirupathur', '37': 'Thirupur', '8': 'Thiruvannamalai', 
    '9': 'Thiruvarur', '27': 'Thiruvellore', '28': 'Tuticorin', '29': 'Vellore', 
    '10': 'Villupuram', '11': 'Virudhunagar'
  };
  
  const COMMODITY_CODES = {
    '78': 'Tomato', '23': 'Onion', '24': 'Potato', '35': 'Brinjal', '154': 'Cabbage',
    '153': 'Carrot', '34': 'Cauliflower', '19': 'Banana', '88': 'Chilly Capsicum',
    '85': 'Bhindi(Ladies Finger)', '82': 'Bottle gourd', '81': 'Bitter gourd',
    '159': 'Cucumbar(Kheera)', '155': 'Ladies Finger', '94': 'Beans', '164': 'Capsicum',
    '87': 'Green Chilli', '26': 'Chili Red', '25': 'Garlic', '103': 'Ginger(Green)',
    '161': 'Raddish', '20': 'Mango', '22': 'Grapes', '18': 'Orange', '17': 'Apple',
    '77': 'Mousambi(Sweet Lime)', '71': 'Chikoos(Sapota)', '73': 'Water Melon',
    '72': 'Papaya', '190': 'Pomegranate', '21': 'Pineapple'
  };
  
  // Convert to array format for dropdowns
  const districts = Object.entries(DISTRICT_CODES).map(([code, name]) => ({ code, name }));
  const commodities = Object.entries(COMMODITY_CODES).map(([code, name]) => ({ code, name }));
  
  const [selectedState, setSelectedState] = useState('Tamil Nadu');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('78'); // Default to Tomato
  const [commodityFilter, setCommodityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Initialize dates (today and 7 days ago)
  useEffect(() => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    setDateFrom(formatDateForApi(oneWeekAgo));
    setDateTo(formatDateForApi(today));
  }, []);

  const formatDateForApi = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearch = async () => {
    if (!selectedDistrict) {
      setError('Please select a district');
      return;
    }
    
    if (!selectedCommodity) {
      setError('Please select a commodity');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using the backend API instead of generating random data
      const districtName = DISTRICT_CODES[selectedDistrict];
      const commodityName = COMMODITY_CODES[selectedCommodity];
      
      // Construct the API URL with query parameters
      const apiUrl = `http://localhost:5000/api/market-prices?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(districtName)}&commodity=${encodeURIComponent(commodityName)}&date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch market data');
      }
      
      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!marketData || !marketData.data) return [];
    
    const sortableData = [...marketData.data];
    return sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowRight className="h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  // Filter commodities based on search
  const filteredCommodities = commodities.filter(commodity => 
    commodity.name.toLowerCase().includes(commodityFilter.toLowerCase())
  );

  // Filter districts based on search
  const filteredDistricts = districts.filter(district => 
    district.name.toLowerCase().includes(districtFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-[1000px]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-#10947c " style={{ color: '#10947c'}}>Agricultural Market Price Dashboard</h1>
          <div className="text-sm text-gray-500">Tamil Nadu Agricultural Data</div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* State Selection (Fixed to Tamil Nadu) */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <div className="relative">
                <input
                  type="text"
                  value="Tamil Nadu"
                  disabled
                  className="w-full rounded-md border border-gray-300 py-2 px-3 bg-gray-100 shadow-sm text-gray-700"
                />
              </div>
            </div>
            
            {/* District Selection with Search */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <input
                    type="text"
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    placeholder="Search districts..."
                    className="w-full py-2 px-3 border-none focus:outline-none"
                  />
                  <div className="px-2 text-gray-400">
                    <Filter className="h-4 w-4" />
                  </div>
                </div>
                
                {districtFilter && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                    {filteredDistricts.length > 0 ? filteredDistricts.map(district => (
                      <div
                        key={district.code}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                        onClick={() => {
                          setSelectedDistrict(district.code);
                          setDistrictFilter(district.name);
                        }}
                      >
                        {district.name}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No districts found</div>
                    )}
                  </div>
                )}
              </div>
              {selectedDistrict && (
                <div className="mt-1 text-sm text-blue-600">
                  Selected: {DISTRICT_CODES[selectedDistrict]}
                </div>
              )}
            </div>
            
            {/* Commodity Selection with Search */}
            <div>
              <label htmlFor="commodity" className="block text-sm font-medium text-gray-700 mb-2">Commodity</label>
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                  <input
                    type="text"
                    value={commodityFilter}
                    onChange={(e) => setCommodityFilter(e.target.value)}
                    placeholder="Search commodities..."
                    className="w-full py-2 px-3 border-none focus:outline-none"
                  />
                  <div className="px-2 text-gray-400">
                    <Filter className="h-4 w-4" />
                  </div>
                </div>
                
                {commodityFilter && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                    {filteredCommodities.length > 0 ? filteredCommodities.map(commodity => (
                      <div
                        key={commodity.code}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm"
                        onClick={() => {
                          setSelectedCommodity(commodity.code);
                          setCommodityFilter(commodity.name);
                        }}
                      >
                        {commodity.name}
                      </div>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No commodities found</div>
                    )}
                  </div>
                )}
              </div>
              {selectedCommodity && (
                <div className="mt-1 text-sm text-blue-600">
                  Selected: {COMMODITY_CODES[selectedCommodity]}
                </div>
              )}
            </div>
            
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="DD-MMM-YYYY"
                      className="w-full rounded-l-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="absolute right-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      placeholder="DD-MMM-YYYY"
                      className="w-full rounded-r-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="absolute right-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search Button */}
          <div className="mt-6">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" style={{backgroundColor:"#10947c"}}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="-ml-1 mr-2 h-5 w-5" />
                  Search Market Data
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Table */}
        {marketData && marketData.data && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Market Prices for {marketData.parameters.commodity} in {marketData.parameters.district}, {marketData.parameters.state}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {marketData.data.length} results from {marketData.parameters.date_from} to {marketData.parameters.date_to}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('market')}>
                      <div className="flex items-center">
                        Market
                        {getSortIcon('market')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('variety')}>
                      <div className="flex items-center">
                        Variety
                        {getSortIcon('variety')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('min_price')}>
                      <div className="flex items-center">
                        Min Price (₹)
                        {getSortIcon('min_price')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('max_price')}>
                      <div className="flex items-center">
                        Max Price (₹)
                        {getSortIcon('max_price')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('modal_price')}>
                      <div className="flex items-center">
                        Modal Price (₹)
                        {getSortIcon('modal_price')}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>
                      <div className="flex items-center">
                        Date
                        {getSortIcon('date')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedData().map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.market}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.variety || 'Standard'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.min_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.max_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {item.modal_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {marketData.data.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No market data found for the selected criteria.</p>
              </div>
            )}
          </div>
        )}
      </main>
      
     
    </div>
  );
};

export default MarketPriceDashboard;