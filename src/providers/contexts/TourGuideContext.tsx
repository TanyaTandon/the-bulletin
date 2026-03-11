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
import Shepherd from "shepherd.js";
import type { Tour, Step, StepOptionsButton } from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";

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
  const shepherdRef = useRef<Tour | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tourReady, setTourReady] = useState(false);

  // Refs for step tracking and callbacks (avoid stale closures)
  const stepIndexRef = useRef(-1);
  const beforeStepChangeCallbacks = useRef<Array<(step: number) => void>>([]);
  const afterStepChangeCallbacks = useRef<Array<(step: number) => void>>([]);
  const finishCallbacks = useRef<Array<() => void>>([]);
  const beforeExitCallbacks = useRef<Array<() => void>>([]);
  const afterExitCallbacks = useRef<Array<() => void>>([]);

  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: false },
        scrollTo: false,
      },
    });

    tour.on("show", () => {
      const step = tour.getCurrentStep();
      if (!step) return;
      const idx = tour.steps.indexOf(step as Step);
      const prevIdx = stepIndexRef.current;

      // Fire "before step change" with the index of the step being left
      beforeStepChangeCallbacks.current.forEach((cb) => cb(prevIdx));

      stepIndexRef.current = idx;
      setCurrentStep(idx);
      setIsVisible(true);

      afterStepChangeCallbacks.current.forEach((cb) => cb(idx));
    });

    tour.on("complete", () => {
      setIsVisible(false);
      setIsOnboarding(false);
      finishCallbacks.current.forEach((cb) => cb());
    });

    tour.on("cancel", () => {
      setIsVisible(false);
      setIsOnboarding(false);
      beforeExitCallbacks.current.forEach((cb) => cb());
      afterExitCallbacks.current.forEach((cb) => cb());
    });

    shepherdRef.current = tour;
    setTourReady(true);

    return () => {
      tour.cancel();
      shepherdRef.current = null;
    };
  }, []);

  // Tour actions
  const startTour = useCallback(async () => {
    if (!shepherdRef.current) return;
    setIsVisible(true);
    setIsOnboarding(true);
    await shepherdRef.current.start();
  }, []);

  const stopTour = useCallback(() => {
    if (!shepherdRef.current) return;
    setIsVisible(false);
    setIsOnboarding(false);
    shepherdRef.current.cancel();
  }, []);

  const nextStep = useCallback(() => {
    shepherdRef.current?.next();
  }, []);

  const prevStep = useCallback(() => {
    shepherdRef.current?.back();
  }, []);

  const visitStep = useCallback((stepIndex: number | "next" | "prev") => {
    if (!shepherdRef.current) return;
    if (stepIndex === "next") {
      shepherdRef.current.next();
    } else if (stepIndex === "prev") {
      shepherdRef.current.back();
    } else {
      shepherdRef.current.show(stepIndex);
    }
  }, []);

  const finishTour = useCallback(() => {
    if (!shepherdRef.current) return;
    setIsVisible(false);
    setIsOnboarding(false);
    shepherdRef.current.complete();
  }, []);

  // Configuration (no-ops kept for interface compatibility)
  const setSteps = useCallback((_steps: TourStep[]) => {}, []);
  const setOptions = useCallback((_options: object) => {}, []);

  const initializeTour = useCallback(
    async (steps: TourStep[]) => {
      if (!shepherdRef.current || isInitialized) return;
      const tour = shepherdRef.current;

      steps.forEach((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        const buttons: StepOptionsButton[] = [];
        if (!isFirst) {
          buttons.push({
            text: "← Back",
            secondary: true,
            action: () => tour.back(),
          });
        }
        buttons.push({
          text: isLast ? "Finish" : "Next →",
          action: () => tour.next(),
        });

        tour.addStep({
          id: `step-${index}`,
          title: step.title,
          text: step.content || "",
          attachTo: step.target
            ? { element: step.target, on: "bottom" }
            : undefined,
          buttons,
          cancelIcon: { enabled: false },
        });
      });

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

  // Utility methods
  const refresh = useCallback(() => {}, []);

  const refreshDialog = useCallback(() => {
    const step = shepherdRef.current?.getCurrentStep();
    if (step) {
      step.updateStepOptions({ ...(step as any).options });
    }
  }, []);

  const updatePositions = useCallback(() => {
    const step = shepherdRef.current?.getCurrentStep();
    if (step) {
      step.updateStepOptions({ ...(step as any).options });
    }
  }, []);

  const deleteFinishedTour = useCallback((_groupKey?: string) => {}, []);

  const updateCurrentStepTarget = useCallback(
    async (target: string | HTMLElement) => {
      const step = shepherdRef.current?.getCurrentStep();
      if (step) {
        step.updateStepOptions({
          ...(step as any).options,
          attachTo: { element: target, on: "bottom" },
        });
      }
    },
    []
  );

  // Stable tour adapter — getters always read from refs/live state
  const tour: TourInstance = useMemo(
    () =>
      tourReady
        ? {
            get isFinished() {
              return !shepherdRef.current?.isActive();
            },
            get activeStep() {
              return stepIndexRef.current;
            },
            nextStep: () => shepherdRef.current?.next(),
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
