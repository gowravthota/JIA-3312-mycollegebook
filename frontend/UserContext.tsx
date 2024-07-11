import React, { createContext, useState, useContext, ReactNode } from "react";
import { User } from "./Types";

const UserContext = createContext<UserContextType | null>(null);

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};