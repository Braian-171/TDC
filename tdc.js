import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Rocket, Clock, Orbit, Info, X } from 'lucide-react';

const TimeDilationCalculator = () => {
  const [velocity, setVelocity] = useState(0);
  const [time, setTime] = useState(1);
  const [timeUnit, setTimeUnit] = useState('hours');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const lastTapTime = useRef(0);
  const containerRef = useRef(null);

  // Speed of light in meters per second (exact value)
  const SPEED_OF_LIGHT = 299792458;

  // Conversion factors to seconds
  const TIME_UNITS = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    years: 31536000 // Using standard year (365 days)
  };

  // Double-tap handler
  const handleDoubleTap = useCallback((e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      setIsInfoVisible(prev => !prev);
    }
    
    lastTapTime.current = currentTime;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleDoubleTap);
      
      return () => {
        container.removeEventListener('touchstart', handleDoubleTap);
      };
    }
  }, [handleDoubleTap]);

  const formatLargeNumber = useCallback((num) => {
    // Prevent potential NaN or Infinity
    if (!isFinite(num) || isNaN(num)) return "Extremely Large Number";
    
    if (num > 1e50) {
      const exponent = Math.floor(Math.log10(num));
      const mantissa = num / Math.pow(10, exponent);
      return `${mantissa.toFixed(4)} × 10^${exponent}`;
    }
    return num.toLocaleString('en-US', { 
      maximumFractionDigits: 20,
      useGrouping: true 
    });
  }, []);

  const calculateTimeDilation = useCallback(() => {
    // Reset previous errors
    setError(null);
    setResult(null);

    // Validate inputs
    if (time < 0) {
      setError("Time cannot be negative");
      return;
    }

    if (velocity < 0) {
      setError("Velocity cannot be negative");
      return;
    }

    // Convert input time to seconds
    const timeInSeconds = time * TIME_UNITS[timeUnit];

    // Ensure velocity is a valid number and very close to, but not exactly at, speed of light
    const speedRatio = Math.min(velocity, SPEED_OF_LIGHT - 0.000001) / SPEED_OF_LIGHT;
    
    if (speedRatio <= 0) {
      return;
    }

    // Time dilation calculation using Lorentz factor
    const dilationFactor = 1 / Math.sqrt(1 - Math.pow(speedRatio, 2));
    const dilatedTimeInSeconds = timeInSeconds * dilationFactor;

    // Convert back to selected unit
    const dilatedTime = dilatedTimeInSeconds / TIME_UNITS[timeUnit];

    setResult({
      dilationFactor: formatLargeNumber(dilationFactor),
      dilatedTime: formatLargeNumber(dilatedTime),
      originalTime: time,
      timeUnit: timeUnit,
      velocity: velocity,
      speedRatio: (speedRatio * 100).toFixed(6)
    });
  }, [time, timeUnit, velocity, formatLargeNumber]);

  // Info page component
  const InfoPage = () => (
    <div className="fixed inset-0 z-50 bg-black/90 text-white p-6 overflow-y-auto">
      <button 
        onClick={() => setIsInfoVisible(false)}
        className="absolute top-4 right-4 bg-red-600 rounded-full p-2 hover:bg-red-700 transition-colors"
      >
        <X size={24} />
      </button>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-blue-400 text-center mb-6">Time Dilation Calculator</h1>
        
        <section>
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">About the App</h2>
          <p className="text-gray-200 mb-4">
            This interactive calculator demonstrates the fascinating phenomenon of time dilation as predicted by Einstein's special relativity. 
            By inputting time and velocity, you can explore how time changes when approaching the speed of light.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">What is Time Dilation?</h2>
          <p className="text-gray-200 mb-4">
            Time dilation is a real physical effect where time passes differently for objects moving at different velocities. 
            As an object approaches the speed of light, time slows down relative to a stationary observer.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-xl text-blue-400 mb-2">Key Principles:</h3>
            <ul className="list-disc list-inside text-gray-200 space-y-2">
              <li>Time is not absolute but relative to the observer's frame of reference</li>
              <li>The faster an object moves, the slower time passes for that object</li>
              <li>Time dilation becomes significant near the speed of light</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">How to Use</h2>
          <p className="text-gray-200 mb-4">
            Enter a time value and select a unit (seconds, minutes, hours, days, or years). 
            Then input a velocity in meters per second. The calculator will show you how time dilates at that speed.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold text-blue-300 mb-4">Mathematical Foundation</h2>
          <p className="text-gray-200 mb-4">
            Time dilation is calculated using the Lorentz factor: γ = 1 / √(1 - v²/c²)
            Where:
            - v is the velocity
            - c is the speed of light (299,792,458 m/s)
          </p>
        </section>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-indigo-900 flex items-center justify-center p-4"
    >
      {isInfoVisible && <InfoPage />}
      
      <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-500/30">
        <div className="flex items-center justify-center mb-6 relative">
          <Rocket className="text-blue-400 mr-4" size={40} />
          <h1 className="text-3xl font-bold text-white">Time Dilation Calculator</h1>
          <button 
            onClick={() => setIsInfoVisible(true)}
            className="absolute right-0 text-blue-300 hover:text-blue-200 transition-colors"
          >
            <Info size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Clock className="text-blue-300 mr-3" size={24} />
            <label className="text-white mr-2">Time:</label>
            <input 
              type="number" 
              value={time}
              onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg p-2 mr-2"
              min="0"
            />
            <select 
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="bg-gray-700 text-white rounded-lg p-2"
            >
              {Object.keys(TIME_UNITS).map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <Orbit className="text-blue-300 mr-3" size={24} />
            <label className="text-white mr-2">Velocity (m/s):</label>
            <input 
              type="number" 
              value={velocity}
              onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg p-2"
              max={299792458}
              min="0"
            />
          </div>

          <button 
            onClick={calculateTimeDilation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Calculate Time Dilation
          </button>

          {error && (
            <div className="bg-red-700/30 rounded-lg p-4 mt-4 text-center">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-gray-700 rounded-lg p-4 mt-4 text-center">
              <h2 className="text-xl font-semibold text-blue-300 mb-2">Dilation Results</h2>
              <p className="text-white">
                Dilation Factor: <span className="text-blue-400 break-words">{result.dilationFactor}</span>
              </p>
              <p className="text-white">
                Dilated Time: <span className="text-blue-400 break-words">
                  {result.dilatedTime} {result.timeUnit}
                </span>
              </p>
              <small className="text-gray-400 block mt-2">
                * At {result.velocity.toLocaleString()} m/s
                * Speed Ratio: {result.speedRatio}%
                * Original Time: {result.originalTime} {result.timeUnit}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeDilationCalculator;
