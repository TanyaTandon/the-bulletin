import { createContext, useContext } from "react";

type ToastContextType = {
  showToast: (message: any) => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
