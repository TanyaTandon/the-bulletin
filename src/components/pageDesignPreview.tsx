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
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Lila, Nick, Tanya, calculateFontSize } from "@/lib/bulletin-templates";
import { TourGuideClient } from "@sjmc11/tourguidejs";
import {
  useTourGuide,
  useTourGuideWithInit,
} from "@/providers/contexts/TourGuideContext";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { Bulletin } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { UploadedImage } from "./NewUploadImageGrid";

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
  setImages: (imageToInsert: UploadedImage, imageIndex: number) => void;
  setImageIndex: (imageIndex: number) => void;
  imageIndex: number | null;
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
  setImages,
  setImageIndex,
  imageIndex,
}) => {
  const isMobile = useIsMobile();
  const { tour, nextStep, updateCurrentStepTarget } = useTourGuide();
  const user = useAppSelector(staticGetUser);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeInitializedRef = useRef<boolean>(false);
  const lastContentRef = useRef<{
    templateId: number;
    scale: number;
    isMobile: boolean;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate dimensions with scale factor
  const baseWidth = isMobile ? "75vw" : "25vw"; // Your current base width
  const aspectRatio = isMobile ? 0.725 : 0.65; // Your current aspect ratio

  const scaledWidth = `calc(${baseWidth} * ${scale})`;

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

  const [fontSize, setFontSize] = useState<number>(0);

  const templates = useMemo(() => {
    const name = user?.firstName ?? "nick";
    const fontSize = calculateFontSize(name);
    setFontSize(fontSize);

    return {
      0: Nick(images, bodyText, name, fontSize),
      1: Lila(images, bodyText, name, fontSize),
      2: Tanya(images, bodyText, name, fontSize),
    };
  }, [images, bodyText, user?.firstName]);

  // Memoize the base template - only regenerates when template changes
  const baseTemplateHTML = useMemo(() => {
    return templates[selectedTemplate.id];
  }, [templates, selectedTemplate.id]);

  // Helper to update content inside iframe without rewriting document
  const updateIframeContent = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframeInitializedRef.current) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || doc.readyState !== "complete") return;

    // Update text content - only innerHTML, preserve structure
    const textEl = doc.querySelector(".text");
    if (textEl) {
      textEl.innerHTML = bodyText;
    }

    // Update name content
    const nameEl = doc.getElementById("nameElement");
    if (nameEl) {
      const name = (user?.firstName ?? "nick").toLowerCase();
      nameEl.textContent = name;
    }

    // Update images - only background-image URL, don't touch any other styles
    const imgEls = doc.querySelectorAll("[data-image-index]");
    imgEls.forEach((el) => {
      const idx = parseInt(
        (el as HTMLElement).getAttribute("data-image-index") || "-1"
      );
      if (
        !Number.isNaN(idx) &&
        idx >= 0 &&
        idx < images.length &&
        images[idx]
      ) {
        const existingStyle = (el as HTMLElement).style.cssText;
        // Extract non-background-image properties
        const otherStyles = existingStyle
          .split(";")
          .filter((s) => !s.trim().startsWith("background-image"))
          .join(";");
        // Set only the background-image, preserving other styles
        (el as HTMLElement).style.cssText =
          `${otherStyles}; background-image: url('${images[idx]}');`.replace(
            /^; /,
            ""
          );
      }
    });
  }, [bodyText, images, user?.firstName]);

  // Full document write - only when template/scale/isMobile changes
  useEffect(() => {
    if (!iframeRef.current || !baseTemplateHTML) return;

    const iframe = iframeRef.current;
    const width = iframe.offsetWidth;
    if (width === 0) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const needsFullWrite =
      !iframeInitializedRef.current ||
      lastContentRef.current?.templateId !== selectedTemplate.id ||
      lastContentRef.current?.scale !== scale ||
      lastContentRef.current?.isMobile !== isMobile;

    if (needsFullWrite) {
      const scaleFactor = (width / 520) * scale;

      const scaledTemplate = baseTemplateHTML
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

      iframeInitializedRef.current = true;
      lastContentRef.current = {
        templateId: selectedTemplate.id,
        scale,
        isMobile,
      };
    }
  }, [baseTemplateHTML, selectedTemplate.id, scale, isMobile]);

  // Update content in-place when images or bodyText change
  useEffect(() => {
    if (!iframeInitializedRef.current) return;
    // Small delay to ensure iframe is ready after potential full write
    const timeoutId = setTimeout(() => {
      updateIframeContent();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [images, bodyText, updateIframeContent]);

  const [buttonMouseOver, setButtonMouseOver] = useState<boolean>(false);

  const handleReplaceImage = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

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

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log("event.data", event);
      if (event.data?.type === "BUTTON_CLICKED") {
        if (event.data.buttonId === "edit") {
          handleReplaceImage();
          setImageIndex(event.data.imageIndex);
        }
        if (event.data.buttonId === "delete") {
          setEditState(EditState.IMAGES);
        }
      }
      if (event.data?.type === "TEXT_CLICKED") {
        setEditState(EditState.BLURB);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (imageIndex === null) {
      alert("no image inded yo");
      return;
    }

    console.log("imageIndex", imageIndex);
    if (files.length === 1 && imageIndex !== null) {
      const newImage = {
        id: crypto.randomUUID(),
        url: URL.createObjectURL(files[0]),
        file: files[0],
      };
      console.log("setting image", newImage, imageIndex);
      setImages(newImage, imageIndex);
    }

    if (event.target.value) {
      event.target.value = "";
    }
  };

  const [mO, setMO] = useState<boolean>(false);

  // Transition for the dismiss (X) button
  const xButtonTransition = useTransition(!!editState, {
    from: { opacity: 0, h: 0 },
    enter: { opacity: 1, h: 50 },
    leave: { opacity: 0, h: 0 },
    config: { tension: 250, friction: 22 },
  });

  useEffect(() => {
    const templateHolder = document.querySelector(".templateHolder");

    templateHolder.addEventListener("mouseenter", function () {
      setMO(true);
    });

    templateHolder.addEventListener("mouseleave", function () {
      setMO(false);
      // or remove it entirely:
      // this.removeAttribute('data-hover');
    });
    return () => {
      templateHolder.removeEventListener("mouseenter", function () {
        setMO(true);
      });
      templateHolder.removeEventListener("mouseleave", function () {
        setMO(false);
      });
    };
  }, []);

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
        className="container relative templateHolder"
        onMouseEnter={!isMobile ? handleContainerMouseEnter : undefined}
        onMouseMove={!isMobile ? handleContainerMouseMove : undefined}
        onMouseLeave={!isMobile ? handleContainerMouseLeave : undefined}
      >
        <animated.div
          data-tg-title="Bulletin Preview"
          ref={containerRef}
          onMouseEnter={!isMobile ? handlePreviewMouseEnter : undefined}
          className="bg-white rounded-lg shadow-lg mx-auto flex relative wrap"
          style={containerStyle}
          onMouseLeave={handlePreviewMouseLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            multiple={false}
            className="hidden"
            onChange={handleFileSelect}
          />
          <iframe
            ref={iframeRef}
            className="iframeHERE border-0"
            style={{
              width: "100%",
              aspectRatio: `${aspectRatio}`, // Browser calculates height automatically
              zIndex: 1000,
            }}
            title="Page Preview"
            sandbox="allow-same-origin allow-scripts"
          />
          <section
            style={{
              position: "relative",
              zIndex: 1,
              height: "auto",
              display: "block",
              maxHeight: "110px",
            }}
          >
            {xButtonTransition((styles, show) =>
              show ? (
                <animated.div
                  style={{
                    // overflow: "hidden",
                    height: styles.h,
                    opacity: styles.opacity,
                  }}
                >
                  <button
                    className="templateButton"
                    onClick={() => setEditState(null)}
                  >
                    <XIcon />
                  </button>
                </animated.div>
              ) : null
            )}
            <button
              data-tg-title="template-button"
              style={
                mO || editState || isMobile
                  ? { opacity: 1, cursor: "pointer", marginTop: "10px" }
                  : { opacity: 0, cursor: "default", marginTop: "0px" }
              }
              className="templateButton"
              onClick={() => {
                if (tour) {
                  updateCurrentStepTarget("[data-tg-title='template-button']");
                }
                setEditState(EditState.TEMPLATE);
              }}
            >
              <NotebookIcon />
            </button>
          </section>
        </animated.div>
      </div>
    </section>
  );
};

export default PageDesignPreview;
