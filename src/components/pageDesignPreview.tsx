import { EditState } from "@/pages/bulletin";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSpring, animated, useTransition } from "@react-spring/web";
import {
  CalendarIcon,
  ImagesSquareIcon,
  NotebookIcon,
  PencilLineIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Lila, Nick, Tanya, calculateFontSize } from "@/lib/bulletin-templates";
import { TourGuideClient } from "@sjmc11/tourguidejs";
import { useTourGuide } from "@/providers/contexts/TourGuideContext";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { Bulletin } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageDesignPreviewProps {
  currentStep: number;
  onboarding: boolean;
  images: string[];
  editState: EditState;
  setEditState: (editState: EditState) => void;
  bodyText: string;
  selectedTemplate: { id: number; name: string };
  hover: {
    preview: boolean;
    buttons: boolean;
  };
  setHover: {
    preview: (hover: boolean) => void;
    buttons: (hover: boolean) => void;
  };
  existingBulletin?: Bulletin;
  scale?: number; // Scale multiplier for dimensions (1 = default, 2 = double size, 0.5 = half size)
}

const PageDesignPreview: React.FC<PageDesignPreviewProps> = ({
  images,
  editState,
  setEditState,
  bodyText,
  selectedTemplate,
  hover,
  setHover,
  onboarding,
  currentStep,
  existingBulletin,
  scale = 1, // Default scale of 1 (no scaling)
}) => {
  const isMobile = useIsMobile();
  const { tour } = useTourGuide();
  const user = useAppSelector(staticGetUser);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add state to track iframe width for proper height calculation
  const [iframeWidth, setIframeWidth] = useState<number>(0);

  // Calculate dimensions with scale factor
  const baseWidth = isMobile ? "75vw" : "25vw"; // Your current base width
  const aspectRatio = isMobile ? 0.725 : 0.65; // Your current aspect ratio

  const scaledWidth = `calc(${baseWidth} * ${scale})`;

  // Calculate frame height based on tracked width
  const frameHeight =
    iframeWidth > 0 ? Math.round(iframeWidth / aspectRatio) : 900; // Fallback height

  console.log("🍓", iframeWidth);
  // Tilt animation spring
  const [tiltProps, setTiltProps] = useSpring(() => ({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { tension: 300, friction: 40 },
  }));

  // Container mouse handlers for tilt animation
  const handleContainerMouseEnter = () => {
    if (!onboarding) {
      setHover.preview(true);
    }
  };

  const handleContainerMouseLeave = () => {
    if (!onboarding) {
      setHover.preview(false);
      // Reset tilt animation when leaving container
      if (!editState) {
        setTiltProps({
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });
      }
    }
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only apply tilt effect when hover.preview is true and editState is falsy
    if (!hover.preview || editState || !containerRef.current || onboarding)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation values (max 15 degrees)
    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((y - centerY) / centerY) * -15;

    setTiltProps({
      rotateX,
      rotateY,
      scale: 1.02,
    });
  };

  // Bulletin Preview animated.div mouse handlers for buttons
  const handlePreviewMouseEnter = () => {
    if (!onboarding) {
      // Clear any existing timeout when re-entering
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHover.buttons(true);
      // Reset tilt when entering preview area
      if (!editState) {
        setTiltProps({
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });
      }
    }
  };

  const handlePreviewMouseLeave = () => {
    if (!onboarding) {
      // Set timeout to hide buttons after 1 second
      hoverTimeoutRef.current = setTimeout(() => {
        setHover.buttons(false);
        hoverTimeoutRef.current = null;
      }, 1000);
    }
  };

  const templates = useMemo(() => {
    const name = user?.firstName ?? "nick";
    const fontSize = calculateFontSize(name);

    return {
      0: Nick(images, bodyText, name, fontSize),
      1: Lila(images, bodyText, name, fontSize),
      2: Tanya(images, bodyText, name, fontSize),
    };
  }, [images, bodyText, user?.firstName]);

  useEffect(() => {
    if (iframeRef.current && iframeWidth > 0) {
      console.log("🍕");
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Calculate scale factor based on width (520 is base size)
      const scaleFactor = (iframeWidth / 520) * scale;

      // Insert scaling CSS into the template
      console.log("selectedTemplate", selectedTemplate);
      const scaledTemplate = templates[selectedTemplate.id]
        .replace(
          "<style>",
          `<style>
          html { font-size: ${scaleFactor * 16}px; }
          * { transform-origin: top left; }
        `
        )
        .replace(/(\d+)px/g, (match, value) => {
          return `${Math.round(parseInt(value) * scaleFactor)}px`;
        })
        .replace(/font-size: (\d+)rem/g, (match, value) => {
          return `font-size: ${value}rem`;
        });

      doc.open();
      doc.write(scaledTemplate);
      doc.close();
    }
  }, [iframeWidth, images, bodyText, selectedTemplate, templates, scale]);

  // Effect to measure and track iframe width
  useEffect(() => {
    const updateIframeWidth = () => {
      if (iframeRef.current) {
        const width = iframeRef.current.offsetWidth;
        if (width > 0 && width !== iframeWidth) {
          setIframeWidth(width);
        }
      }
    };

    // Initial measurement
    updateIframeWidth();

    // Set up ResizeObserver to track width changes
    const resizeObserver = new ResizeObserver(() => {
      updateIframeWidth();
    });

    if (iframeRef.current) {
      resizeObserver.observe(iframeRef.current);
    }

    // Also measure on window resize
    const handleResize = () => {
      updateIframeWidth();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [iframeWidth]);

  const setter = useCallback(
    (editState: EditState, toSet: EditState) => {
      if (editState === toSet) {
        setEditState(null);
      } else {
        setEditState(toSet);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const [buttonMouseOver, setButtonMouseOver] = useState<boolean>(false);

  const handleButtonMouseLeave = useCallback(() => {
    setButtonMouseOver(false);
  }, []);

  const buttons = useMemo(
    () => [
      {
        id: "close",
        image: <XIcon size={32} />,
        label: "close",
        onClick: () => {
          setter(editState, null);
          setHover.buttons(false);
        },
      },
      {
        id: "images",
        image: <ImagesSquareIcon size={32} />,
        label: "Edit Images",
        onClick: () => {
          if (onboarding) {
            console.log("onboarding");
            tour?.nextStep();
          }
          setter(editState, EditState.IMAGES);
        },
      },
      {
        id: "blurb",
        image: <PencilLineIcon size={32} />,
        label: "edit description",
        onClick: () => setter(editState, EditState.BLURB),
      },
      {
        id: "template",
        image: <NotebookIcon size={32} />,
        label: "choose template",
        onClick: () => setter(editState, EditState.TEMPLATE),
      },
    ],
    [editState, tour, onboarding, setHover, setter]
  );

  const containerCenterX = (iframeWidth || 400) / 2.25;
  const getArcPosition = (index: number, total: number) => {
    const arcRadius = 120 * scale; // Scale the arc radius
    const arcSpan = Math.PI * 0.6; // 108 degrees in radians
    const startAngle = Math.PI / 2 + arcSpan / 2; // Start from bottom-right
    const angle = startAngle - (index / (total - 1)) * arcSpan;

    // Calculate the center of the container (scaled)
    const containerCenterY = frameHeight / 8.5;

    return {
      x: Math.cos(angle) * arcRadius + containerCenterX,
      y: onboarding
        ? Math.sin(angle) * arcRadius + containerCenterY
        : Math.sin(angle) * arcRadius * -1 + containerCenterY,
    };
  };

  // Fixed button transitions - use stable array reference
  const buttonTransitions = useTransition(buttons, {
    from: {
      opacity: 0,
      transform: `translate(${containerCenterX}px, 30px) scale(0.8)`,
    },
    enter: (item, index) => async (next) => {
      if (!hover.buttons) return; // Don't animate in if not hovering
      // Stagger the animations
      await new Promise((resolve) => setTimeout(resolve, index * 80));

      // Keep close button at origin, others go to arc positions
      if (item.id === "close") {
        await next({
          opacity: 1,
          transform: `translate(${containerCenterX}px, 30px) scale(1)`,
        });
      } else {
        const pos = getArcPosition(index, buttons.length);
        await next({
          opacity: 1,
          transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`,
        });
      }
    },
    leave: {
      opacity: 0,
      transform: `translate(${containerCenterX}px, 30px) scale(0.8)`,
    },
    update: (item, index) => {
      if (hover.buttons) {
        // Keep close button at origin, others go to arc positions
        if (item.id === "close") {
          return {
            opacity: 1,
            transform: `translate(${containerCenterX}px, 30px) scale(1)`,
          };
        } else {
          const pos = getArcPosition(index, buttons.length);
          return {
            opacity: 1,
            transform: `translate(${pos.x}px, ${pos.y}px) scale(1)`,
          };
        }
      } else {
        return {
          opacity: 0,
          transform: `translate(${containerCenterX}px, 30px) scale(0.8)`,
        };
      }
    },
    keys: (item) => item.id,
    config: {
      tension: 300,
      friction: 20,
    },
  });

  // Container style with scale applied
  const containerStyle = useMemo(() => {
    const style: React.CSSProperties = {
      width: scaledWidth,
      // @ts-ignore
      transform: tiltProps.rotateX.to(
        (x) =>
          `perspective(1000px) rotateX(${x}deg) rotateY(${tiltProps.rotateY.get()}deg) scale(${tiltProps.scale.get()})`
      ),
      transformStyle: "preserve-3d",
    };
    return style;
  }, [scaledWidth, tiltProps]);

  console.log(iframeRef.current);

  return (
    <section className="w-full max-w-6xl mx-auto p-6">
      <div
        style={
          isMobile
            ? {
                paddingRight: "0px",
                paddingLeft: "0px",
              }
            : {}
        }
        className="container relative"
        onMouseEnter={!isMobile ? handleContainerMouseEnter : undefined}
        onMouseMove={
          !isMobile && !buttonMouseOver ? handleContainerMouseMove : undefined
        }
        onMouseLeave={
          !isMobile && !buttonMouseOver ? handleContainerMouseLeave : undefined
        }
      >
        <animated.div
          data-tg-title="Bulletin Preview"
          ref={containerRef}
          onMouseEnter={!isMobile ? handlePreviewMouseEnter : undefined}
          className="bg-white rounded-lg shadow-lg mx-auto relative"
          style={containerStyle}
          onMouseLeave={!buttonMouseOver ? handlePreviewMouseLeave : undefined}
        >
          <div
            className="HERE"
            ref={buttonContainerRef}
            onMouseLeave={!isMobile && handleButtonMouseLeave}
          >
            {buttonTransitions((style, item, _, index) => (
              <animated.div
                data-tg-title={`select ${item.id}`}
                onMouseOver={() => {
                  setButtonMouseOver(true);
                  if (!buttonMouseOver) {
                    setHover.buttons(true);
                  }
                }}
                key={item.id}
                style={style}
                className="absolute pointer-events-auto"
              >
                <button
                  onClick={item.onClick}
                  className="bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow duration-200 border border-gray-200"
                  title={item.label}
                >
                  {item.image}
                </button>
              </animated.div>
            ))}
          </div>
          {isMobile ? (
            <div
              onClick={() => {
                setHover.buttons(true);
              }}
              style={{
                position: "absolute",
                width: iframeRef.current?.offsetWidth,
                height: iframeRef.current?.offsetHeight,
              }}
            ></div>
          ) : null}
          <iframe
            ref={iframeRef}
            className="iframeHERE border-0"
            style={{
              width: "100%", // Fill container width
              height: frameHeight,
            }}
            title="Page Preview"
            sandbox="allow-same-origin"
          />
        </animated.div>
      </div>
    </section>
  );
};

export default PageDesignPreview;
