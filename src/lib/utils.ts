/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadedImage } from "@/components/ImageUploadGrid";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { Bulletin } from "./api";
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
import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
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
): Promise<
  PayloadAction<
    any,
    string,
    {
      arg: {
        bulletin: Partial<Bulletin>;
        images: UploadedImage[];
        imageIndex: number;
      };
      requestId: string;
      requestStatus: "fulfilled";
    },
    never
  >
> {
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
          .then((res) => {
            toast.success("Image updated!");
            return res;
          });
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
