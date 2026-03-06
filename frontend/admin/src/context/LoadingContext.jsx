/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from "react";
import Loader from "../components/Loader"; // loader overlay component
import { attachLoader } from "../api/axios";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  // hook up axios interceptors once
  useEffect(() => {
    attachLoader(setLoading);
  }, [setLoading]);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {loading && <Loader />} 
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);