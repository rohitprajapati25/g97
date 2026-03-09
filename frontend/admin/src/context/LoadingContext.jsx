/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useRef } from "react";
import Loader from "../components/Loader"; // loader overlay component
import { attachLoader } from "../api/axios";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // Smart loading - only show loader for operations taking longer than minimum time
  const handleSetLoading = (isLoading) => {
    if (isLoading) {
      // Clear any existing timer
      if (timerRef.current) clearTimeout(timerRef.current);
      
      // Only show loader after 300ms delay (prevents flicker for quick requests)
      timerRef.current = setTimeout(() => {
        setLoading(true);
      }, 300);
    } else {
      // Clear the delay timer
      if (timerRef.current) clearTimeout(timerRef.current);
      // Hide loader immediately
      setLoading(false);
    }
  };

  // hook up axios interceptors once
  useEffect(() => {
    attachLoader(handleSetLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ setLoading: handleSetLoading }}>
      {loading && <Loader />} 
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
