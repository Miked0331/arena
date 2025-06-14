import { createContext, useContext, useState } from 'react';

const ClanContext = createContext();

export const useClans = () => useContext(ClanContext);

export const ClanProvider = ({ children }) => {
  const [clans, setClans] = useState([
    { id: '1', name: 'Red Raptors', members: 12, description: 'Fearless Gears warriors!' },
    { id: '2', name: 'Steel Storm', members: 8, description: 'Unstoppable team of strategists.' },
    { id: '3', name: 'Shadow Wolves', members: 15, description: 'Silent but deadly.' },
  ]);

  const addClan = (clan) => {
    setClans((prev) => [...prev, clan]);
  };

  return (
    <ClanContext.Provider value={{ clans, addClan }}>
      {children}
    </ClanContext.Provider>
  );
};
