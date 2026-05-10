"use client";

import { usePathname } from "next/navigation";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface NavContextType {
  actionButtons: ReactNode;
  setActionButtons: React.Dispatch<React.SetStateAction<ReactNode>>;
}

export const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavContextProvider = ({ children }: { children: ReactNode }) => {
  const pathName = usePathname();
  const [actionButtons, setActionButtons] = useState<ReactNode>(null);

  useEffect(() => {
    setActionButtons(null);
  }, [pathName]);

  return (
    <NavContext.Provider value={{ actionButtons, setActionButtons }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNavContext = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within a NavContextProvider");
  }
  return context;
};
