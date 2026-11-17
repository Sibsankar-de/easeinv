"use client";

import * as React from "react";
import type { ProductDTO, ProductVariantDTO } from "@/types";
import { toast } from "sonner";

export interface CartItem {
  id: string; // composite key: productId-variantId
  product: ProductDTO;
  variant?: ProductVariantDTO;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: ProductDTO, quantity?: number, variant?: ProductVariantDTO) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "store_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Initialize from localStorage on mount (SSR safe)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  // Save to localStorage when items update
  React.useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, isMounted]);

  const getItemKey = (productId: string, variantId?: string) =>
    variantId ? `${productId}-${variantId}` : productId;

  const addItem = React.useCallback(
    (product: ProductDTO, quantity = 1, variant?: ProductVariantDTO) => {
      const key = getItemKey(product.id, variant?.id);
      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === key);
        if (existingIndex > -1) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
          return updated;
        }
        return [
          ...prev,
          {
            id: key,
            product,
            variant,
            quantity,
          },
        ];
      });

      toast.success("Added to cart", {
        description: `${product.title} ${variant ? `(${variant.title})` : ""} added to your bag.`,
      });
    },
    []
  );

  const removeItem = React.useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info("Item removed from cart");
  }, []);

  const updateQuantity = React.useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = React.useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = React.useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.variant ? item.variant.price : item.product.price;
        return sum + price * item.quantity;
      }, 0),
    [items]
  );

  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 15.0;
  const tax = subtotal * 0.08; // 8% estimated tax
  const total = subtotal + shipping + tax;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        shipping,
        tax,
        total,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
