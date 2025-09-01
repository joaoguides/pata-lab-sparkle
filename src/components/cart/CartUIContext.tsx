import { createContext, useContext, useState, ReactNode } from "react";

interface CartUIContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <CartUIContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const context = useContext(CartUIContext);
  if (context === undefined) {
    throw new Error("useCartUI must be used within a CartUIProvider");
  }
  return context;
}