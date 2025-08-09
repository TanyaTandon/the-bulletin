import { UploadedImage } from "@/components/ImageUploadGrid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { createNewBulletin } from "./api";
import { CalendarNote } from "@/components/BlurbInput";
import { setUser, User } from "@/redux/user";
import { NavigateFunction } from "react-router";
import { Dispatch } from "@reduxjs/toolkit";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ecn(...inputs: ClassValue[]) {
  return cn(inputs);
}

export const anonhandleSubmitBulletin = async (
  phoneNumber: string,
  images: UploadedImage[],
  blurb: string,
  savedNotes: CalendarNote[],
  setIsSubmitting: (isSubmitting: boolean) => void,
  navigate: NavigateFunction,
  dispatch: Dispatch,
  setImages: (images: UploadedImage[]) => void,
  setBlurb: (blurb: string) => void,
  setSavedNotes: (savedNotes: CalendarNote[]) => void
) => {
  if (!blurb && images.length === 0) {
    toast.error("Please add some content to your bulletin before submitting");
    return;
  }

  // Validate the number of images
  if (images.length > 4) {
    toast.error("You can only upload up to 4 images");
    return;
  }

  setIsSubmitting(true);

  try {
    toast.loading("Saving your bulletin...");

    await createNewBulletin({
      user: { phone_number: phoneNumber, images: [], bulletins: [] } as User,
      bulletin: {
        images: images,
        blurb: blurb,
        savedNotes: savedNotes,
        owner: phoneNumber,
      },
    }).then((response) => {
      console.log("Response:", response);
      if (response.newUserData) {
        dispatch(setUser(response.newUserData[0]));
      }
      if (response.success) {
        navigate(`/bulletin/${response.bulletinId}`);
      } else {
        toast.error("We couldn't save your bulletin. Please try again.");
      }
    });

    toast.dismiss();

    setImages([]);
    setBlurb("");
    setSavedNotes([]);

    navigate("/bulletin/filled");
  } catch (error) {
    console.error("Error saving bulletin:", error);
    toast.error("We couldn't save your bulletin. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
