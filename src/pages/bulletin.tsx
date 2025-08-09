import React, { CSSProperties, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format, addMonths, isBefore, isAfter } from "date-fns";
import { useSpring, animated, useTransition } from "@react-spring/web";
import Layout from "@/components/Layout";
import ImageUploadGrid, { UploadedImage } from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import MonthlyTimer from "@/components/MonthlyTimer";
import TypewriterText from "@/components/TypewriterText";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Image, FileText, LoaderCircle, Heart } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Dialog } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { setUser } from "@/redux/user";
import { anonhandleSubmitBulletin } from "@/lib/utils";
import axios from "axios";
import "@sjmc11/tourguidejs/src/scss/tour.scss"; // Styles
import { TourGuideStep } from "@sjmc11/tourguidejs/src/types/TourGuideStep";
import { useTourGuideWithInit } from "@/providers/contexts/TourGuideContext";
import PageDesignPreview from "@/components/pageDesignPreview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import BigCalendar from "@/components/BigCalendar";
import { setShowFriendsModal } from "@/redux/nonpersistent/controllers";
import { useDialog } from "@/providers/dialog-provider";
import FriendModalContent from "@/components/FriendModalContent";
import { Bulletin } from "@/lib/api";
import { isEqual } from "lodash";

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
  const [hover, setHover] = useState<boolean>(false);
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

  const handleSubmitBulletin = async () => {
    if (!blurb && images.length === 0) {
      toast.error("Please add some content to your bulletin before submitting");
      return;
    }

    // Validate the number of images
    if (images.length > selectedTemplate.images) {
      toast.error(
        `You can only upload up to ${selectedTemplate.images} images`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      toast.loading("Saving your bulletin...");

      // Create a FormData object to properly handle file uploads
      const formData = new FormData();

      // Add the non-file data
      formData.append("user", JSON.stringify(user));
      formData.append("blurb", blurb);
      formData.append("savedNotes", JSON.stringify(savedNotes));
      formData.append("owner", user?.phone_number || "");

      // Process and append each image
      const processedImages = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const fetchBlob = await fetch(image.url, {
          method: "GET",
          headers: {
            Accept: "image/png",
          },
        });

        const blob = await fetchBlob.blob();
        console.log("Blob created:", blob);

        // Create a filename for the image
        const filename = `image_${i}_${Date.now()}.png`;

        // Append the actual file to FormData
        formData.append(`images`, blob, filename);

        // Keep track of image metadata
        processedImages.push({
          id: image.id,
          filename: filename,
        });
      }

      // Add image metadata as a JSON string
      formData.append("imageMetadata", JSON.stringify(processedImages));

      // Use FormData with axios
      const response = await axios.post(
        "https://lvwebhookrepo-production.up.railway.app/bulletinCreation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", response);

      if (response.data.newUserData) {
        dispatch(setUser(response.data.newUserData[0]));
      }

      if (response.data.success) {
        navigate(`/bulletin/${response.data.bulletinId}`);
      } else {
        toast.error("We couldn't save your bulletin. Please try again.");
      }

      toast.dismiss();
      setImages([]);
      setBlurb("");
      setSavedNotes([]);
    } catch (error) {
      console.error("Error saving bulletin:", error);
      toast.error("We couldn't save your bulletin. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("images", images);
  const saveBulletin = async () => {
    if (
      isEqual(
        {
          images: refereenceBulletinData?.images,
          blurb: refereenceBulletinData?.blurb,
          savedNotes: refereenceBulletinData?.savedNotes,
          template: refereenceBulletinData?.template,
        },
        {
          images: images,
          blurb: blurb,
          savedNotes: savedNotes,
          template: selectedTemplate.id,
        }
      )
    ) {
      toast.error("No changes to save");
      return;
    } else {
      const formData = new FormData();

      if (blurb !== refereenceBulletinData?.blurb) {
        formData.append("blurb", blurb);
      }
      if (!isEqual(savedNotes, refereenceBulletinData?.savedNotes)) {
        formData.append("savedNotes", JSON.stringify(savedNotes));
      }
      if (selectedTemplate.id !== refereenceBulletinData?.template) {
        formData.append("template", selectedTemplate.id);
      }

      formData.append("id", refereenceBulletinData?.id);

      console.log({
        images: refereenceBulletinData?.images,
        blurb: refereenceBulletinData?.blurb,
        savedNotes: refereenceBulletinData?.savedNotes,
        template: refereenceBulletinData?.template,
      });

      if (!isEqual(images, refereenceBulletinData?.images)) {
        const processedImages = [];

        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          if (image.url.includes("blob")) {
            const fetchBlob = await fetch(image.url, {
              method: "GET",
              headers: {
                Accept: "image/png",
              },
            });

            const blob = await fetchBlob.blob();
            console.log("Blob created:", blob);

            // Create a filename for the image
            const filename = `image_${i}_${Date.now()}.png`;

            // Append the actual file to FormData
            formData.append(`images`, blob, filename);

            // Keep track of image metadata
            processedImages.push({
              id: image.id,
              filename: filename,
            });
          } else {
            processedImages.push({
              id: image.id,
            });
          }
        }

        formData.append("imageMetadata", JSON.stringify(processedImages));
      }

      const response = await axios.put(
        "http://localhost:3900/bulletinUpdate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("response", response);
      console.log("FormData:", formData);

      toast.error("not good comp to save");
    }
  };

  console.log("User:", images);

  const [searchParams] = useSearchParams();

  const tourSteps: TourGuideStep[] = [
    {
      content: "let's get familiar with how to get started!",
      title: "hi and welcome to the Bulletin!",
    },
    {
      content: "you can choose a layout, add images, and add a blurb",
      title: "this is your bulletin!",
      target: "[data-tg-title='Bulletin Preview']",
    },
    {
      content: "hovering over the preview will allow you to edit the layout",
      target: "[data-tg-title='Bulletin Preview']",
    },
    {
      title: "click this icon to select some images",
      content:
        "you can add a certain number depending on the layout you choose",
      target: "[data-tg-title='select images']",
    },
    {
      title: "after you choose some images, write a blurb about your month",
      content:
        "after you select the images you want, they'll populate the template",
      target: "[data-tg-title='select blurb']",
    },
    {
      title: "next, play around with different layouts",
      content:
        "some are for the photographers among us, while others are for our writer friends",
      target: "[data-tg-title='select template']",
    },
    {
      title: "lastly, let's add some dates",
      content: "select the right tab to check out the calendar",
      target: "[data-tg-title='tab housing']",
    },
    {
      title: "add some upcoming events to your calendar for next month",
      content:
        "select a date cell, enter a short note for the day, and your friends can see what you're looking forward to",
      target: "[data-tg-title='calendar housing']",
    },
    {
      title: "tea! your bulletin is ready",
      content: "click the submit button to save your bulletin",
      target: "[data-tg-title='submit button']",
    },
    {
      title: "lastly let's add some friends to your bulletin for the month",
      content: "click the submit button to save your bulletin",
      target: "[data-tg-title='friend modal']",
    },
  ];

  const {
    currentStep,
    isOnboarding,
    startTour,
    onBeforeStepChange,
    isVisible,
    initializeTour,
    tour,
    isInitialized,
  } = useTourGuideWithInit();

  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (onboarding && !isVisible && !isInitialized) {
      initializeTour(tourSteps);
      startTour();
      onBeforeStepChange((currentStep) => {
        console.log("currentStep", currentStep);
        if (currentStep == 1) {
          setHover(true);
        }
        if (currentStep == 5) {
          setTabValue("notes");
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
  ]);

  const today = new Date();

  const firstOfNextMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    1
  );

  const [editState, setEditState] = useState<EditState | null>(null);

  const previewAnimation = useSpring({
    transform: editState
      ? `translateX(${isMobile ? "-10px" : "-20px"})`
      : "translateX(0px)",
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
      // await updatePositions();
      await tour.updatePositions();
    }
    if (isOnboarding && tabValue === "notes") {
      console.log("updating positions");
      setTimeout(() => {
        syncPostions();
      }, 100);
    }
  }, [isOnboarding, tabValue, tour]);

  const { dialog } = useDialog();

  useEffect(() => {
    console.log("existingBulletin", existingBulletin);
    if (existingBulletin) {
      setImages(existingBulletin.images);
      setBlurb(existingBulletin.blurb);
      setSavedNotes(existingBulletin.savedNotes);
      console.log(existingBulletin.savedNotes);
      const template = templates.find(
        (template) => template.id === Number(existingBulletin.template)
      );
      setSelectedTemplate(template);
    }
  }, [existingBulletin]);

  return (
    <Layout>
      <div
        className={`${isMobile ? "px-4 pt-0" : "py-6 w-[80%] mx-auto pt-4"}`}
      >
        <aside className="flex gap-4 items-center">
          <h1 className="text-2xl font-bold text-left">
            Your Bulletin for
            {firstOfNextMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              day: "numeric",
            })}
          </h1>
          <Tabs
            defaultValue="page"
            onValueChange={(e) => {
              if (isOnboarding && e === "notes") {
                tour?.nextStep();
                setTimeout(async () => {
                  console.log("updating positions");
                  await tour?.updatePositions();
                }, 500);
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
        </aside>

        <section data-tg-title="Image Housing" className="flex gap-4 relative">
          {tabValue === "page" ? (
            <>
              <animated.div style={previewAnimation} className="flex-shrink-0">
                <PageDesignPreview
                  currentStep={currentStep}
                  onboarding={isOnboarding}
                  hover={hover}
                  setHover={setHover}
                  setEditState={setEditState}
                  editState={editState}
                  images={images.map((image) => image.url)}
                  bodyText={blurb ?? customPlaceholder}
                  selectedTemplate={selectedTemplate}
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
                      handleSubmitBulletin={handleSubmitBulletin}
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
        <aside className="flex justify-end mt-[7.5vh]">
          <Button
            data-tg-title="submit button"
            variant="primary"
            onClick={() => {
              if (existingBulletin) {
                toast.loading("saving bulletin");
                saveBulletin();
                toast.dismiss();
              } else {
                handleSubmitBulletin();

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
        </aside>
      </div>
    </Layout>
  );
};

export default BulletinPage;
