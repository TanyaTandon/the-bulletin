import { TourGuideStep } from "@sjmc11/tourguidejs/src/types/TourGuideStep";
import { useMemo } from "react";

export const tourSteps: TourGuideStep[] = [
  {
    title: "Hi and welcome to the Bulletin!",
    content: `The Bulletin is social media in the real world! Once a month, your close friends or family members will receive a physical copy of your monthly update in the mail alongside anyone else who's added them as a recipient. Let's get started!`
  },
  {
    title: "let's start by adding an image!",
    content: "just tap or click on one of the empty images!",
    target: "[data-tg-title='Bulletin Preview']",
  },
  {
    title: "next let's add a description about your month",
    content:
      "just tap or click on the text between the images, then write about your month! everything gets saved as you type!",
    target: "[data-tg-title='Bulletin Preview']"

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
    title: "now that we've filled out our bulletin, we'll add some recipients!",
    content:"",
  },
  {
    title: "there're a couple ways to send out your bulletin!",
    content: "",
    target: "[data-tg-title='friend_modal_trigger']",
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
