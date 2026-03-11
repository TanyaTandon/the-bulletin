import type { TourStep } from "@/providers/contexts/TourGuideContext";

export const tourSteps: TourStep[] = [
  {
    title: "Hi and welcome to the Bulletin!",
    content: `The Bulletin is social media in the real world! Once a month, your close friends or family members will receive a physical copy of your monthly life update in the mail alongside anyone else who's added them! Let's get started!`,
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
    title: "now that we've filled out our bulletin, we'll add some recipients!",
    content: "",
  },
  {
    title: "there're a couple ways to send out your bulletin!",
    content: "",
    target: "[data-tg-title='friend_modal_trigger']",
  },
  {
    title: "amazing! last order of business is your subscribtion!",
    content:
      "once you've subscribed, your bulletin will be sent out to your recipients at the end of the month!",
  },
];
