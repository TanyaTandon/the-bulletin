import React, { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionIcon } from "@phosphor-icons/react";

type DialogOptions = {
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
  additionalClosingAction?: () => void;
};

type DialogContextType = {
  isOpen: boolean;
  dialog: (children: React.ReactNode, options?: DialogOptions) => void;
  close: (closeOnly?: boolean) => void;
  options: DialogOptions | null;
  content: React.ReactNode | null;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  const dialog = (children: React.ReactNode, options?: DialogOptions) => {
    setIsOpen(true);
    setOptions(options ?? null);
    setContent(children);
  };

  const close = (closeOnly: boolean = false) => {
    if (options?.additionalClosingAction && !closeOnly) {
      options.additionalClosingAction();
    }
    setIsOpen(false);
    setTimeout(() => {
      setOptions(null);
      setContent(null);
    }, 300);
  };

  const value = {
    isOpen,
    dialog,
    close,
    options,
    content,
  };

  const isMobile = useIsMobile();

  console.log(isMobile);
  return (
    <DialogContext.Provider value={value}>
      <Dialog open={isOpen} onOpenChange={() => close()}>
        <DialogContent
          className={`w-[${isMobile ? "90vw" : "50vw"}] max-w-[90%]`}
        >
          <QuestionIcon className="absolute top-2 right-2" size={18} />
          {options?.title && (
            <DialogHeader>
              <DialogTitle className={options.titleOptions?.className}>
                {options.title}
              </DialogTitle>
            </DialogHeader>
          )}
          {content}
          {options?.footer && (
            <DialogFooter className={options.footerOptions?.className}>
              {options.footer}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};

// Updated hook that uses the context
export function useDialog() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
}
