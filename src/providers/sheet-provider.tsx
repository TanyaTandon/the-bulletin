import React, { createContext, useContext, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type SheetOptions = {
  header?: React.ReactNode;
  headerOptions?: {
    className?: string;
  };
  title?: React.ReactNode;
  titleOptions?: {
    className?: string;
  };
  footer?: React.ReactNode;
  footerOptions?: {
    className?: string;
  };
  description?: React.ReactNode;
  descriptionOptions?: {
    className?: string;
  };
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

type SheetContextType = {
  isOpen: boolean;
  sheet: (children: React.ReactNode, options?: SheetOptions) => void;
  close: () => void;
  options: SheetOptions | null;
  content: React.ReactNode | null;
};

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export const SheetProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<SheetOptions | null>(null);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const sheet = (children: React.ReactNode, options?: SheetOptions) => {
    setIsOpen(true);
    setOptions(options ?? null);
    setContent(children);
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
      setContent(null);
    }, 300);
  };

  const value = {
    isOpen,
    sheet,
    close,
    options,
    content,
  };

  const isMobile = useIsMobile();

  return (
    <SheetContext.Provider value={value}>
      <Sheet open={isOpen} onOpenChange={() => close()}>
        <SheetContent
          side={options?.side || "right"}
          className={options?.className || "bg-[#fff8eb]"}
        >
          {options?.title && (
            <SheetHeader className={options.headerOptions?.className}>
              <SheetTitle className={options.titleOptions?.className}>
                {options.title}
              </SheetTitle>
            </SheetHeader>
          )}
          {content}
          {options?.footer && (
            <SheetFooter className={options.footerOptions?.className}>
              {options.footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      {children}
    </SheetContext.Provider>
  );
};

// Hook that uses the context
export function useSheet() {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error("useSheet must be used within a SheetProvider");
  }
  return context;
}
