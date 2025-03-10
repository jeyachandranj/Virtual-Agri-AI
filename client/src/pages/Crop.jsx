import React, { useState } from 'react';
import { Camera, Upload, RefreshCw, AlertCircle, Leaf, AlertTriangle, Sprout, Shield, Info } from 'lucide-react';

const PlantDiseaseDetector = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.match('image/*')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(droppedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleFileChange;
    input.click();
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/detect-disease', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-green-800 mb-2 flex items-center justify-center">
            <Leaf className="text-green-600 mr-2" size={32} />
            Plant Health Diagnosis
          </h1>
          <p className="text-slate-600">Identify plant diseases and get comprehensive treatment solutions instantly</p>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Upload Section */}
          {!preview ? (
            <div 
              className="p-8 border-b border-gray-100"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-xl p-10 text-center transition-all hover:border-green-400">
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <Upload className="h-16 w-16 text-green-500" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium text-lg">Drag and drop plant image here</p>
                    <p className="text-gray-500 mt-2">or use one of these options</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    <label className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <button 
                      onClick={handleCapture}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-colors flex items-center"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Take Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Preview */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-medium text-gray-800">Image Preview</h3>
                    <button 
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 flex justify-center">
                    <img 
                      src={preview} 
                      alt="Plant preview" 
                      className="max-h-64 rounded" 
                    />
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`w-full ${loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center`}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Diagnose Plant Disease
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Results Section - Now spans 2 columns */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md md:col-span-2">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-medium text-gray-800">Diagnosis Results</h3>
                  </div>
                  <div className="p-6">
                    {loading && (
                      <div className="text-center py-12">
                        <RefreshCw className="h-12 w-12 mx-auto text-green-500 animate-spin mb-4" />
                        <p className="text-gray-700">Analyzing your plant...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-red-800">Error</h3>
                            <p className="text-red-700 mt-1">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!loading && !error && !result && (
                      <div className="text-center py-12">
                        <Sprout className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Click "Diagnose Plant Disease" to analyze</p>
                      </div>
                    )}
                    
                    {result && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {result.plant && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <Leaf className="h-5 w-5 text-green-600 mr-2" />
                                <h3 className="font-semibold text-green-800">Plant Identified</h3>
                              </div>
                              <p className="text-green-700">{result.plant}</p>
                            </div>
                          )}
                          
                          {result.disease && (
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                                <h3 className="font-semibold text-orange-800">Disease Detected</h3>
                              </div>
                              <p className="text-orange-700">{result.disease}</p>
                            </div>
                          )}
                        </div>
                        
                        {result.solution && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Info className="h-5 w-5 text-blue-600 mr-2" />
                              <h3 className="font-semibold text-blue-800">Recommended Solution</h3>
                            </div>
                            <p className="text-blue-700">{result.solution}</p>
                          </div>
                        )}
                        
                        {result.pesticides && (
                          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Shield className="h-5 w-5 text-purple-600 mr-2" />
                              <h3 className="font-semibold text-purple-800">Recommended Pesticides</h3>
                            </div>
                            <p className="text-purple-700">{result.pesticides}</p>
                          </div>
                        )}
                        
                        {result.explanation && (
                          <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Info className="h-5 w-5 text-teal-600 mr-2" />
                              <h3 className="font-semibold text-teal-800">Why These Pesticides Work</h3>
                            </div>
                            <p className="text-teal-700">{result.explanation}</p>
                          </div>
                        )}
                        
                        {!result.plant && !result.disease && result.full_response && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-1">AI Analysis</h3>
                            <p className="text-gray-700">{result.full_response}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantDiseaseDetector;