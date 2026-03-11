import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { driver } from "driver.js";
import type { Driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

// The tour instance interface exposed to consumers
export type TourInstance = {
  isFinished: boolean;
  activeStep: number;
  nextStep: () => void;
} | null;

// Simplified step type for our usage
export type TourStep = {
  title?: string;
  content?: string;
  target?: string;
};

interface TourGuideContextType {
  // Tour instance adapter
  tour: TourInstance;

  // State
  isVisible: boolean;
  currentStep: number;
  isOnboarding: boolean;
  isInitialized: boolean;

  // Actions
  startTour: () => Promise<void>;
  stopTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  visitStep: (stepIndex: number | "next" | "prev") => void;
  finishTour: () => void;

  // Configuration
  setSteps: (steps: TourStep[]) => void;
  setOptions: (options: object) => void;
  initializeTour: (steps: TourStep[], options?: object) => Promise<void>;

  // Event handlers
  onBeforeStepChange: (callback: (currentStep: number) => void) => void;
  onAfterStepChange: (callback: (currentStep: number) => void) => void;
  onFinish: (callback: () => void) => void;
  onBeforeExit: (callback: () => void) => void;
  onAfterExit: (callback: () => void) => void;

  // Utility
  refresh: () => void;
  refreshDialog: () => void;
  updatePositions: () => void;
  deleteFinishedTour: (groupKey?: string) => void;

  // Step management
  updateCurrentStepTarget: (target: string | HTMLElement) => Promise<void>;
}

const TourGuideContext = createContext<TourGuideContextType | undefined>(
  undefined
);

interface TourGuideProviderProps {
  children: ReactNode;
  initialOptions?: object;
  initialSteps?: TourStep[];
}

export const TourGuideProvider: React.FC<TourGuideProviderProps> = ({
  children,
}) => {
  const driverRef = useRef<Driver | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tourReady, setTourReady] = useState(false);

  // Refs for tracking state and callbacks (avoid stale closures)
  const stepIndexRef = useRef(-1);
  const completedRef = useRef(false);
  const beforeStepChangeCallbacks = useRef<Array<(step: number) => void>>([]);
  const afterStepChangeCallbacks = useRef<Array<(step: number) => void>>([]);
  const finishCallbacks = useRef<Array<() => void>>([]);
  const beforeExitCallbacks = useRef<Array<() => void>>([]);
  const afterExitCallbacks = useRef<Array<() => void>>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  // Tour actions
  const startTour = useCallback(async () => {
    if (!driverRef.current) return;
    setIsVisible(true);
    setIsOnboarding(true);
    driverRef.current.drive();
  }, []);

  const stopTour = useCallback(() => {
    if (!driverRef.current) return;
    setIsVisible(false);
    setIsOnboarding(false);
    driverRef.current.destroy();
  }, []);

  const nextStep = useCallback(() => {
    driverRef.current?.moveNext();
  }, []);

  const prevStep = useCallback(() => {
    driverRef.current?.movePrevious();
  }, []);

  const visitStep = useCallback((stepIndex: number | "next" | "prev") => {
    if (!driverRef.current) return;
    if (stepIndex === "next") driverRef.current.moveNext();
    else if (stepIndex === "prev") driverRef.current.movePrevious();
    else driverRef.current.moveTo(stepIndex);
  }, []);

  const finishTour = useCallback(() => {
    if (!driverRef.current) return;
    completedRef.current = true;
    setIsVisible(false);
    setIsOnboarding(false);
    driverRef.current.destroy();
  }, []);

  // No-ops kept for interface compatibility
  const setSteps = useCallback((_steps: TourStep[]) => {}, []);
  const setOptions = useCallback((_options: object) => {}, []);

  const initializeTour = useCallback(
    async (steps: TourStep[]) => {
      if (driverRef.current || isInitialized) return;

      const driveSteps: DriveStep[] = steps.map((step) => ({
        ...(step.target ? { element: step.target } : {}),
        popover: {
          title: step.title,
          description: step.content || "",
        },
      }));

      const d = driver({
        allowClose: false,
        showButtons: ["next", "previous"],
        steps: driveSteps,

        onNextClick: (_el, _step, opts) => {
          // Fire "before step change" with index of the step being LEFT
          const idx = opts.state.activeIndex ?? stepIndexRef.current;
          beforeStepChangeCallbacks.current.forEach((cb) => cb(idx));

          if (d.isLastStep()) {
            completedRef.current = true;
            d.destroy();
          } else {
            d.moveNext();
          }
        },

        onPrevClick: () => {
          d.movePrevious();
        },

        onHighlighted: (_el, _step, opts) => {
          const idx = opts.state.activeIndex ?? 0;
          stepIndexRef.current = idx;
          setCurrentStep(idx);
          setIsVisible(true);
          afterStepChangeCallbacks.current.forEach((cb) => cb(idx));
        },

        onDestroyStarted: () => {
          setIsVisible(false);
          setIsOnboarding(false);
        },

        onDestroyed: () => {
          if (completedRef.current) {
            finishCallbacks.current.forEach((cb) => cb());
          } else {
            beforeExitCallbacks.current.forEach((cb) => cb());
            afterExitCallbacks.current.forEach((cb) => cb());
          }
          completedRef.current = false;
          stepIndexRef.current = -1;
        },
      });

      driverRef.current = d;
      setTourReady(true);
      setIsInitialized(true);
    },
    [isInitialized]
  );

  // Event handler registration
  const onBeforeStepChange = useCallback(
    (callback: (currentStep: number) => void) => {
      beforeStepChangeCallbacks.current.push(callback);
    },
    []
  );

  const onAfterStepChange = useCallback(
    (callback: (currentStep: number) => void) => {
      afterStepChangeCallbacks.current.push(callback);
    },
    []
  );

  const onFinish = useCallback((callback: () => void) => {
    finishCallbacks.current.push(callback);
  }, []);

  const onBeforeExit = useCallback((callback: () => void) => {
    beforeExitCallbacks.current.push(callback);
  }, []);

  const onAfterExit = useCallback((callback: () => void) => {
    afterExitCallbacks.current.push(callback);
  }, []);

  // Utility
  const refresh = useCallback(() => {}, []);

  const refreshDialog = useCallback(() => {
    driverRef.current?.refresh();
  }, []);

  const updatePositions = useCallback(() => {
    driverRef.current?.refresh();
  }, []);

  const deleteFinishedTour = useCallback((_groupKey?: string) => {}, []);

  const updateCurrentStepTarget = useCallback(
    async (target: string | HTMLElement) => {
      if (!driverRef.current) return;
      const activeStep = driverRef.current.getActiveStep();
      if (!activeStep) return;

      driverRef.current.highlight({
        element: target,
        popover: activeStep.popover,
      });
    },
    []
  );

  // Stable adapter — getters read live values from refs
  const tour: TourInstance = useMemo(
    () =>
      tourReady
        ? {
            get isFinished() {
              return !driverRef.current?.isActive();
            },
            get activeStep() {
              return stepIndexRef.current;
            },
            nextStep: () => driverRef.current?.moveNext(),
          }
        : null,
    [tourReady]
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
    refreshDialog,
    updatePositions,
    deleteFinishedTour,
    updateCurrentStepTarget,
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
