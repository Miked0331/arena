import { createContext, useContext, useState } from 'react';

const ClanContext = createContext();

export const useClans = () => useContext(ClanContext);

export function ClanProvider({ children }) {
  const [clans, setClans] = useState([]);

  const addClan = (clan) => {
    setClans(prev => [...prev, clan]);
  };

  const updateClan = (id, updatedClan) => {
    setClans(prev => prev.map(c => (c.id === id ? updatedClan : c)));
  };

  const deleteClan = (id) => {
    setClans(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ClanContext.Provider value={{ clans, addClan, updateClan, deleteClan }}>
      {children}
    </ClanContext.Provider>
  );
}
