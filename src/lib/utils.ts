import { UploadedImage } from "@/components/ImageUploadGrid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { Bulletin, createNewBulletin } from "./api";
import { CalendarNote } from "@/components/BlurbInput";
import {
  setUser,
  updateBlurb,
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
  tokens: SessionTokens
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

        const uploads = await Promise.all(
          images.map(async (item) => {
            const formData = new FormData();
            if (item.file) {
              formData.append("bulletin_id", bulletinData.id);
              formData.append("filename", item.id);
              formData.append("image", item.file);
              await fetch("http://localhost:8080/api/image_processing_ffmpeg", {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${tokens.session_jwt}`,
                },
              });
            }
          })
        );

        // for (let i = 0; i < images.length; i++) {
        //   const image = images[i];

        //   if (image.url.includes("blob")) {
        //     const fetchBlob = await fetch(image.url, {
        //       method: "GET",
        //       headers: {
        //         Accept: "image/png",
        //       },
        //     });

        //     const blob = await fetchBlob.blob();
        //     console.log("Blob created:", blob);

        //     // Create a filename for the image
        //     const filename = `image_${i}_${Date.now()}.png`;

        //     // Append the actual file to FormData
        //     formData.append(`images`, blob, filename);

        //     // Keep track of image metadata
        //     processedImages.push({
        //       id: image.id,
        //       filename: filename,
        //     });
        //   } else {
        //     processedImages.push({
        //       id: image.id,
        //     });
        //   }
        // }

        // formData.append("imageMetadata", JSON.stringify(processedImages));
        // const response = await axios.put(
        //   "https://be.thebulletin.app/image_processing",
        //   formData,
        //   {
        //     headers: {
        //       "Content-Type": "multipart/form-data",
        //     },
        //   }
        // );

        // performImagesDbOperation(bulletinData)
        //   .then(() => {

        //     toast.success("Saved!");
        //   })
        //   .catch((error) => {
        //     // Optional: Handle errors
        //     console.error("Error saving images:", error);
        //     showToast("Error saving images");
        //   });
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
