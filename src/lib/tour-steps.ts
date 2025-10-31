import { TourGuideStep } from "@sjmc11/tourguidejs/src/types/TourGuideStep";
import { useMemo } from "react";

export const tourSteps = [
  {
    title: "hi and welcome to the Bulletin!",
    content: "let's get familiar with how to get started!",
  },
  {
    title: "let's start by adding an image!",
    content: "just tap or click on one of the empty images!",
    target: "[data-tg-title='Bulletin Preview']",
  },
  {
    title: "next let's add a description about your month",
    content:
      "just tap or click on the text between the images, then talk about your month! everything gets saved as you type!",
    target: "[data-tg-title='Bulletin Preview']",
  },
  {
    title: "now, let's check out some different templates",
    content:
      "different templates allow for different layouts, number of images, and amount of text",
    target: "[data-tg-title='template-button']",
  },
  {
    title:
      "lastly, lets add some dates to the calendar so friends know what you're up to",
    content:
      "go to the calendar, click on an date, add a note, and then hit save! ",
    target: "[data-tg-title='tab housing']",
  },
  {
    title: "now we'll add some recipients!",
    
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
