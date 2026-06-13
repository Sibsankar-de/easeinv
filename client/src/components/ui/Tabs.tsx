"use client";

import React, { createContext, useContext } from "react";
import { cn } from "../utils";
import { ConditionalDiv } from "./ConditionalDiv";

export const TabContext = createContext<{ activeTab: string }>({
  activeTab: "",
});
export const useTabContext = () => useContext(TabContext);

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TabsProps {
  children: React.ReactNode;
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({
  children,
  tabs,
  activeTab,
  onChange,
  className,
}: TabsProps) => {
  return (
    <TabContext.Provider value={{ activeTab }}>
      <div
        className={cn("flex border-b border-gray-200 w-full mb-6", className)}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "px-5 py-3.5 font-medium text-sm border-b-2 cursor-pointer outline-none",
                "flex items-center gap-2",
                "border-transparent transition-all duration-150",
                isActive
                  ? "border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {children}
    </TabContext.Provider>
  );
};

export const TabContent = ({
  tabId,
  children,
  ...props
}: {
  tabId: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const { activeTab } = useTabContext();
  return (
    <ConditionalDiv condition={activeTab === tabId} {...props}>
      {children}
    </ConditionalDiv>
  );
};
