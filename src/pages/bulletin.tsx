import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSpring, animated, useTransition, update } from "@react-spring/web";
import Layout from "@/components/Layout";
import { UploadedImage } from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { setUser } from "@/redux/user";
import {
  ChangeCategory,
  getDetailedDifferences,
  getFourRandomIndices,
  handleCategoryChange,
} from "@/lib/utils";
import axios from "axios";
import "@sjmc11/tourguidejs/src/scss/tour.scss"; // Styles
import { TourGuideStep } from "@sjmc11/tourguidejs/src/types/TourGuideStep";
import {
  useTourGuide,
  useTourGuideWithInit,
} from "@/providers/contexts/TourGuideContext";
import PageDesignPreview from "@/components/pageDesignPreview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BigCalendar from "@/components/BigCalendar";
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "@/components/modalContent/FriendModalContent";
import { Bulletin, createNewBulletin } from "@/lib/api";
import { useStytch } from "@stytch/react";
import { tourSteps } from "@/lib/tour-steps";
import BulletinPreview from "@/components/BulletinPreview";

export enum EditState {
  IMAGES = "images",
  BLURB = "blurb",
  NOTES = "notes",
  TEMPLATE = "template",
}

export const templateTypes = {
  0: "nick",
  1: "lila",
  2: "tanya",
  3: "jackson",
};

export const templates = [
  {
    id: 0,
    name: "Nick",
    images: 6,
    description:
      "You want to show more than tell; let your images speak for themselves! Nick can be flashy.",
  },
  {
    id: 1,
    name: "Lila",
    images: 2,
    description:
      "You might have a little more to say, and a little less to show. Keep some things to yourself. Lila is a good fit.",
  },
  {
    id: 2,
    name: "Tanya",
    images: 5,
    description:
      "Capture the big picture, and play with some variety. Tanya will tell the story right here.",
  },
  {
    id: 3,
    name: "Jackson",
    images: 6,
    description:
      "You've got a lot to show, a lot to tell as well! Jackson is a good fit.",
  },
];

const BulletinPage: React.FC<{
  existingBulletin?: Bulletin;
}> = ({ existingBulletin }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = useAppSelector(staticGetUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [blurb, setBlurb] = useState<string | null>(null);
  const [previewHover, setPreviewHover] = useState<boolean>(false);
  const [buttonHover, setButtonHover] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  const [editState, setEditState] = useState<EditState | null>(null);

  const hover = {
    preview: previewHover,
    buttons: buttonHover,
  };

  const setHover = useMemo(
    () => ({
      preview: (hover: boolean) => setPreviewHover(hover),
      buttons: (hover: boolean) => setButtonHover(hover),
    }),
    [setPreviewHover, setButtonHover]
  );
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: number;
    name: string;
    images: number;
  }>({ id: 0, name: "Nick", images: 6 });

  const refereenceBulletinData = structuredClone(existingBulletin);

  const [savedNotes, setSavedNotes] = useState<CalendarNote[]>([
    {
      date: new Date(),
      note: "I'm an event happening in your life",
      example: true,
    },
  ]);

  const customPlaceholder =
    "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";

  const [searchParams] = useSearchParams();
  const monthAlertShownRef = useRef(false);
  const onboardingNavigateRef = useRef(false);

  const {
    currentStep,
    isOnboarding,
    startTour,
    onBeforeStepChange,
    isVisible,
    initializeTour,
    tour,
    isInitialized,
    updateCurrentStepTarget,
    updatePositions,
  } = useTourGuideWithInit();

  const { dialog, close } = useDialog();

  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (
      (existingBulletin === null || existingBulletin === undefined) &&
      onboarding &&
      !onboardingNavigateRef.current
    ) {
      onboardingNavigateRef.current = true;
      dispatch(createNewBulletin({ user }))
        .unwrap()
        .then((res) => {
          if (res.success) {
            navigate(`/bulletin/${res.bulletinId}?onboarding=true`);
          } else {
            toast.error("We couldn't create a new bulletin. Please try again.");
            onboardingNavigateRef.current = false;
          }
        })
        .catch(() => {
          onboardingNavigateRef.current = false;
        });
    }
  }, [searchParams, existingBulletin, dispatch, user, navigate]);

  const getStartedFunc = async () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("monthAlert");
    window.history.replaceState(null, "", url.toString());
    await dispatch(createNewBulletin({ user }))
      .unwrap()
      .then((res) => {
        if (res.success) {
          navigate(`/bulletin/${res.bulletinId}`);
        } else {
          toast.error("We couldn't create a new bulletin. Please try again.");
        }
      });
  };

  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (
      onboarding &&
      !isVisible &&
      !isInitialized &&
      existingBulletin !== null &&
      loaded
    ) {
      initializeTour(tourSteps as TourGuideStep[]);
      startTour();
      onBeforeStepChange((currentStep) => {
        // console.log("currentStep", currentStep);
        if (currentStep == 1) {
          setPreviewHover(true);
          const bodyEl = document.querySelector("body");
          if (bodyEl && bodyEl.classList.contains("tg-no-interaction")) {
            console.log("removing tg-no-interaction");

            bodyEl.classList.remove("tg-no-interaction");
          }
          setTimeout(() => {
            setEditState(EditState.BLURB);
          }, 900);

          setTimeout(() => {
            updateCurrentStepTarget("[data-tg-title='data-blurb-input']");
          }, 1650);
          setTimeout(() => {
            updatePositions();
          }, 1700);
        }
        if (currentStep == 2) {
          if (editState == null) {
            setEditState(EditState.TEMPLATE);
          }
        }
        if (currentStep == 5) {
          const friendButton = document.querySelector(".friendButton");
          setTimeout(() => {
            if (friendButton) {
              console.log("clicking friend button");
              (friendButton as HTMLElement).click();
            }
          }, 800);
          setTimeout(() => {
            updateCurrentStepTarget("[data-tg-title='friend_modal_content']");
          }, 1000);
        }
      });
    }
  }, [
    searchParams,
    startTour,
    isVisible,
    onBeforeStepChange,
    initializeTour,
    isInitialized,
    editState,
    tourSteps,
    updateCurrentStepTarget,
    updatePositions,
    loaded,
    existingBulletin,
  ]);

  useEffect(() => {
    const monthAlert = searchParams.get("monthAlert");
    if (!monthAlert || !user || monthAlertShownRef.current) return;
    monthAlertShownRef.current = true;
    dialog(
      <div>
        <h1>It's a new month! Let's create a new bulletin.</h1>
        <br />
        <br />
        <BulletinPreview
          images={getFourRandomIndices(user.images).map(
            (num) =>
              `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-preview/${user.images[num]}.png`
          )}
          firstName={user?.firstName ?? "nick"}
        />
        <br />
        <br />
        <Button
          className="block mx-auto"
          onClick={() => {
            getStartedFunc();
            close(true);
          }}
        >
          Get Started!
        </Button>
      </div>,
      {
        additionalClosingAction: getStartedFunc,
      }
    );
  }, [searchParams, user, dialog, close]);

  const today = new Date();

  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth());

  const previewAnimation = useSpring({
    width: editState ? (isMobile ? "45%" : "50%") : isMobile ? "100%" : "100%",
    config: {
      tension: 280,
      friction: 60,
    },
  });

  const blurbTransitions = useTransition(editState, {
    from: {
      opacity: 0,
      transform: "translateX(100px) scale(0.95)",
    },
    enter: {
      opacity: 1,
      transform: "translateX(0px) scale(1)",
    },
    leave: {
      opacity: 0,
      transform: "translateX(100px) scale(0.95)",
    },
    config: {
      tension: 300,
      friction: 30,
    },
  });

  const [tabValue, setTabValue] = useState<string>("page");

  useEffect(() => {
    async function syncPostions() {
      await tour.updatePositions();
    }
    if (isOnboarding && tabValue === "notes") {
      // console.log("updating positions");
      setTimeout(() => {
        syncPostions();
      }, 100);
    }
  }, [isOnboarding, tabValue, tour]);

  useEffect(() => {
    if (existingBulletin) {
      setImages(existingBulletin.images);
      setBlurb(existingBulletin.blurb);
      setSavedNotes(existingBulletin.saved_notes);
      // console.log(existingBulletin.saved_notes);
      const template = templates.find(
        (template) => template.id === existingBulletin.template
      );
      setSelectedTemplate(template);
      // console.log("loaded");
      setLoaded(true);
    }
  }, [existingBulletin]);

  const stytch = useStytch();
  const [imageIndex, setImageIndex] = useState<number | null>(null);

  const tokens = stytch.session.getTokens();

  useEffect(() => {
    // console.log();
    const diff = getDetailedDifferences(
      {
        images: refereenceBulletinData?.images,
        blurb: refereenceBulletinData?.blurb,
        saved_notes: refereenceBulletinData?.saved_notes,
        template: refereenceBulletinData?.template,
      },
      {
        images: images,
        blurb: blurb,
        saved_notes: savedNotes,
        template: selectedTemplate.id,
      }
    );

    // console.log(existingBulletin, diff.unequal, loaded);
    if (existingBulletin && diff.unequal && loaded) {
      // console.log("❤️",diff.differences);
      handleCategoryChange(
        Object.keys(diff.differences)[0] as ChangeCategory,
        {
          images: images,
          blurb: blurb,
          saved_notes: savedNotes,
          template: selectedTemplate.id,
          id: existingBulletin?.id,
        },
        tokens,
        imageIndex + 1
      ).then((arg) => {
        // console.log("arg", arg);

        const bulletin = JSON.parse(arg.payload.data[0].bulletin);
        // console.log(bulletin);
        setImages(
          bulletin.images.map((item) => ({
            id: item.id,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-standardized/${item}.jpeg`,
          }))
        );
        setImageIndex(null);
      });
    }
  }, [loaded, blurb, images, savedNotes, selectedTemplate, existingBulletin]);

  const imageSetFunction = (
    imageToInsert: UploadedImage,
    imageIndex: number
  ) => {
    const newImages = structuredClone(images);
    newImages[imageIndex] = imageToInsert;
    setImages(newImages);
  };

  return (
    <Layout>
      <div
        className={`${isMobile ? "px-4 pt-0" : "py-6 w-[80%] mx-auto pt-4"}`}
      >
        <aside className={`${isMobile ? "block" : "flex"} gap-4 items-center`}>
          {!isMobile && !editState && (
            <h1 className="text-2xl font-bold text-left mb-2">
              Your Bulletin for{" "}
              {firstOfNextMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h1>
          )}
          <section
            className={`tabHousing ${"flex justify-between"} items-center gap-4`}
          >
            <Tabs
              defaultValue="page"
              onValueChange={(e) => {
                if (isOnboarding && e === "notes") {
                  // tour?.nextStep();
                  // setTimeout(async () => {
                  // console.log("updating positions");
                  //   await tour?.updatePositions();
                  // }, 500);
                }
                setTabValue(e);
              }}
              data-tg-title="tab housing"
            >
              <TabsList>
                <TabsTrigger value="page">Page</TabsTrigger>
                <TabsTrigger value="notes">Dates</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              data-tg-title="submit button"
              variant="primary"
              onClick={() => {
                if (existingBulletin) {
                  toast.loading("saving bulletin");
                  // saveBulletin();
                  toast.dismiss();
                } else {
                  if (isOnboarding) {
                    dialog(<FriendModalContent />);
                    setTimeout(() => {
                      tour?.nextStep();
                    }, 500);
                  }
                }
              }}
            >
              {existingBulletin ? "Save" : "Submit"}
            </Button>
          </section>
        </aside>

        <section
          data-tg-title="Image Housing"
          className={`${isMobile ? "block" : "flex"} gap-4 relative`}
        >
          {tabValue === "page" ? (
            <>
              <animated.div style={previewAnimation} className="flex-shrink-0">
                <PageDesignPreview
                  scale={isMobile ? 0.9 : 1}
                  currentStep={currentStep}
                  onboarding={isOnboarding}
                  hover={hover}
                  setHover={setHover}
                  setEditState={setEditState}
                  editState={editState}
                  images={images.map((image) => image.url)}
                  bodyText={blurb ?? customPlaceholder}
                  selectedTemplate={selectedTemplate}
                  setImages={imageSetFunction}
                  setImageIndex={setImageIndex}
                  imageIndex={imageIndex}
                />
              </animated.div>
              {blurbTransitions((style, item) =>
                item ? (
                  <animated.div
                    style={style}
                    className={`${isMobile ? "flex-1" : "flex-1"} min-w-0`}
                  >
                    <BlurbInput
                      selectedTemplate={selectedTemplate}
                      setSelectedTemplate={setSelectedTemplate}
                      editState={editState}
                      savedNotes={savedNotes}
                      setSavedNotes={setSavedNotes}
                      blurb={blurb}
                      setBlurb={setBlurb}
                      images={images}
                      setImages={setImages}
                      placeholder={customPlaceholder}
                      isSubmitting={isSubmitting}
                    />
                  </animated.div>
                ) : null
              )}
            </>
          ) : (
            <BigCalendar
              savedNotes={savedNotes}
              setSavedNotes={setSavedNotes}
            />
          )}
        </section>
      </div>
    </Layout>
  );
};

export default BulletinPage;
