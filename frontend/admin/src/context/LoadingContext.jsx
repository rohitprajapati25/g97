import { createContext, useState, useContext } from "react";
import Loader from "../components/Loader"; // Woh Loader jo maine pehle diya tha

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {loading && <Loader />} 
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);