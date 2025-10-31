import { UploadedImage } from "@/components/ImageUploadGrid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { Bulletin, createNewBulletin } from "./api";
import { CalendarNote } from "@/components/BlurbInput";
import {
  setUser,
  updateBlurb,
  updateImage,
  updateSavedNotes,
  updateTemplate,
  User,
} from "@/redux/user";
import { NavigateFunction } from "react-router";
import { Dispatch } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { store } from "@/redux";
import axios from "axios";
import { SessionTokens } from "@stytch/vanilla-js";

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

export function arrayToDict(arr) {
  return arr.reduce((dict, item) => {
    dict[item.date] = item.note;
    return dict;
  }, {});
}

export enum ChangeCategory {
  IMAGES = "images",
  BLURB = "blurb",
  SAVED_NOTES = "saved_notes",
  TEMPLATE = "template",
}

let blurbTimer: NodeJS.Timeout | null = null;

export async function handleCategoryChange(
  category: ChangeCategory,
  bulletinData: Partial<Bulletin>,
  tokens: SessionTokens,
  imageIndex: number | null
): Promise<void> {
  switch (category) {
    case ChangeCategory.SAVED_NOTES:
      store.dispatch(updateSavedNotes(bulletinData));
      break;

    case ChangeCategory.TEMPLATE:
    case ChangeCategory.BLURB:
      if (blurbTimer) {
        clearTimeout(blurbTimer);
      }

      blurbTimer = setTimeout(() => {
        blurbTimer = null;
        if (bulletinData && category === ChangeCategory.TEMPLATE) {
          store.dispatch(updateTemplate(bulletinData));
        } else if (bulletinData && category === ChangeCategory.BLURB) {
          store.dispatch(updateBlurb(bulletinData));
        }
      }, 1500);
      break;

    case ChangeCategory.IMAGES:
      {
        const images = bulletinData.images;

        console.log(images);

        const result = await store
          .dispatch(
            updateImage({
              bulletin: bulletinData,
              images: images,
              imageIndex: imageIndex,
            })
          )
          .then(() => {
            toast.success("Image updated!");
          });
        result.image = true;
        return result;
      }
      break;

    default:
      console.warn(`Unknown category: ${category}`);
  }
}

export function getDetailedDifferences<T>(
  obj1: T,
  obj2: T
): {
  unequal: boolean;
  differences: Record<string, { obj1: T; obj2: T }>;
} {
  const differences: Record<string, { obj1: T; obj2: T }> = {};

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

  allKeys.forEach((key) => {
    if (!isEqual(obj1[key], obj2[key])) {
      differences[key] = {
        obj1: obj1[key],
        obj2: obj2[key],
      };
    }
  });

  return {
    unequal: Object.keys(differences).length > 0,
    differences,
  };
}
