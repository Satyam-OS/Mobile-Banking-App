import React, { createContext, useContext, useState } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: any) => {
  // This list is empty. Names only appear when someone registers.
  const [kycRequests, setKycRequests] = useState<any[]>([]);

  // This function adds a new registration to the list
  const addKycRequest = (name: string, email: string) => {
    const newRequest = {
      id: Date.now().toString(),
      user: name,
      email: email,
      status: "pending",
      time: "Just now",
    };
    setKycRequests((prev) => [newRequest, ...prev]);
  };

  // This function updates status to 'completed' (Approved) or 'flagged' (Rejected)
  const updateStatus = (id: string, newStatus: string) => {
    setKycRequests((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
  };

  return (
    <AppContext.Provider value={{ kycRequests, addKycRequest, updateStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
