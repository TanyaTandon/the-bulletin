import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { TourGuideClient } from "@sjmc11/tourguidejs/src/Tour";
import { TourGuideOptions } from "@sjmc11/tourguidejs/src/core/options";
import { TourGuideStep } from "@sjmc11/tourguidejs/src/types/TourGuideStep";

interface TourGuideContextType {
  // Tour instance
  tour: TourGuideClient | null;

  // State
  isVisible: boolean;
  currentStep: number;
  isOnboarding: boolean;
  isInitialized: boolean;

  // Actions
  startTour: (group?: string) => Promise<unknown>;
  stopTour: () => Promise<unknown>;
  nextStep: () => Promise<unknown>;
  prevStep: () => Promise<unknown>;
  visitStep: (stepIndex: number | "next" | "prev") => Promise<unknown>;
  finishTour: (exit?: boolean, tourGroup?: string) => Promise<boolean>;

  // Configuration
  setSteps: (steps: TourGuideStep[]) => Promise<void>;
  setOptions: (options: TourGuideOptions) => Promise<TourGuideClient>;
  initializeTour: (
    steps: TourGuideStep[],
    options?: TourGuideOptions
  ) => Promise<void>;

  // Event handlers
  onBeforeStepChange: (callback: (currentStep: number) => void) => void;
  onAfterStepChange: (callback: (currentStep: number) => void) => void;
  onFinish: (callback: () => void) => void;
  onBeforeExit: (callback: () => void) => void;
  onAfterExit: (callback: () => void) => void;

  // Utility
  refresh: () => Promise<unknown>;
  updatePositions: () => Promise<unknown>;
  deleteFinishedTour: (groupKey?: string | "all") => void;
}

const TourGuideContext = createContext<TourGuideContextType | undefined>(
  undefined
);

interface TourGuideProviderProps {
  children: ReactNode;
  initialOptions?: TourGuideOptions;
  initialSteps?: TourGuideStep[];
}

export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({
  children,
  initialOptions = {},
  initialSteps = [],
}) => {
  const [tour, setTour] = useState<TourGuideClient | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tour instance
  useEffect(() => {
    const tourInstance = new TourGuideClient({
      ...initialOptions,
      steps: initialSteps,
    });

    // Set up event listeners
    tourInstance.onBeforeStepChange(() => {
      setCurrentStep(tourInstance.activeStep);
    });

    tourInstance.onAfterStepChange(() => {
      setCurrentStep(tourInstance.activeStep);
    });

    tourInstance.onFinish(() => {
      setIsVisible(false);
      setIsOnboarding(false);
    });

    tourInstance.onBeforeExit(() => {
      setIsVisible(false);
    });

    tourInstance.onAfterExit(() => {
      setIsVisible(false);
      setIsOnboarding(false);
    });

    setTour(tourInstance);

    // Cleanup on unmount
    return () => {
      if (tourInstance) {
        tourInstance.exit();
      }
    };
  }, []);

  // Tour actions
  const startTour = useCallback(
    async (group?: string) => {
      if (!tour) return;
      setIsVisible(true);
      setIsOnboarding(true);
      return await tour.start(group);
    },
    [tour]
  );

  const stopTour = useCallback(async () => {
    if (!tour) return;
    setIsVisible(false);
    setIsOnboarding(false);
    return await tour.exit();
  }, [tour]);

  const nextStep = useCallback(async () => {
    if (!tour) return;
    return await tour.nextStep();
  }, [tour]);

  const prevStep = useCallback(async () => {
    if (!tour) return;
    return await tour.prevStep();
  }, [tour]);

  const visitStep = useCallback(
    async (stepIndex: number | "next" | "prev") => {
      if (!tour) return;
      return await tour.visitStep(stepIndex);
    },
    [tour]
  );

  const finishTour = useCallback(
    async (exit: boolean = true, tourGroup?: string) => {
      if (!tour) return false;
      setIsVisible(false);
      setIsOnboarding(false);
      return await tour.finishTour(exit, tourGroup);
    },
    [tour]
  );

  // Configuration
  const setSteps = useCallback(
    async (steps: TourGuideStep[]) => {
      if (!tour) return;
      return await tour.addSteps(steps);
    },
    [tour]
  );

  const setOptions = useCallback(
    async (options: TourGuideOptions) => {
      if (!tour) throw new Error("Tour not initialized");
      return await tour.setOptions(options);
    },
    [tour]
  );

  // Initialize tour with steps and options (only once)
  const initializeTour = useCallback(
    async (steps: TourGuideStep[], options?: TourGuideOptions) => {
      if (!tour || isInitialized) return;

      if (steps.length > 0) {
        await setSteps(steps);
      }
      if (options) {
        await setOptions(options);
      }
      setIsInitialized(true);
    },
    [tour, isInitialized, setSteps, setOptions]
  );

  // Event handlers
  const onBeforeStepChange = useCallback(
    (callback: (currentStep: number) => void) => {
      if (!tour) return;
      tour.onBeforeStepChange(() => {
        callback(tour.activeStep);
      });
    },
    [tour]
  );

  const onAfterStepChange = useCallback(
    (callback: (currentStep: number) => void) => {
      if (!tour) return;
      tour.onAfterStepChange(() => {
        callback(tour.activeStep);
      });
    },
    [tour]
  );

  const onFinish = useCallback(
    (callback: () => void) => {
      if (!tour) return;
      tour.onFinish(callback);
    },
    [tour]
  );

  const onBeforeExit = useCallback(
    (callback: () => void) => {
      if (!tour) return;
      tour.onBeforeExit(callback);
    },
    [tour]
  );

  const onAfterExit = useCallback(
    (callback: () => void) => {
      if (!tour) return;
      tour.onAfterExit(callback);
    },
    [tour]
  );

  // Utility methods
  const refresh = useCallback(async () => {
    if (!tour) return;
    return await tour.refresh();
  }, [tour]);

  const updatePositions = useCallback(async () => {
    if (!tour) return;
    return await tour.updatePositions();
  }, [tour]);

  const deleteFinishedTour = useCallback(
    (groupKey?: string | "all") => {
      if (!tour) return;
      tour.deleteFinishedTour(groupKey);
    },
    [tour]
  );

  const contextValue: TourGuideContextType = {
    tour,
    isVisible,
    currentStep,
    isOnboarding,
    isInitialized,
    startTour,
    stopTour,
    nextStep,
    prevStep,
    visitStep,
    finishTour,
    setSteps,
    setOptions,
    initializeTour,
    onBeforeStepChange,
    onAfterStepChange,
    onFinish,
    onBeforeExit,
    onAfterExit,
    refresh,
    updatePositions,
    deleteFinishedTour,
  };

  return (
    <TourGuideContext.Provider value={contextValue}>
      {children}
    </TourGuideContext.Provider>
  );
};

// Custom hook to use the TourGuide context
export const useTourGuide = (): TourGuideContextType => {
  const context = useContext(TourGuideContext);
  if (context === undefined) {
    throw new Error("useTourGuide must be used within a TourGuideProvider");
  }
  return context;
};

// Hook that provides initialization function - no automatic initialization
export const useTourGuideWithInit = () => {
  const { initializeTour, isInitialized, ...tourGuide } = useTourGuide();

  return {
    ...tourGuide,
    initializeTour,
    isInitialized,
  };
};
