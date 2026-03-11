import type { TourStep } from "@/providers/contexts/TourGuideContext";

export const tourSteps: TourStep[] = [
  {
    title: "hi and welcome to the Bulletin!",
    content: `The Bulletin is social media in the real world! once a month, your close friends or family members will receive a physical copy of your monthly life update in the mail alongside anyone else who's added them! let's get started!`,
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
      "go to the calendar, click on a date, add a note, and then hit save!",
    target: "[data-tg-title='tab housing']",
  },
  {
    title: "now that we've filled out our bulletin, we'll make sure it gets sent out",
    content: "",
  },
  {
    title: "there're a couple ways to send out your bulletin!",
    content: "Friends are people on the platform — you can add each other to your bulletins and they'll get notified. \n\n Recipients receive your bulletin by mail each month without needing an account, but you can only have 2.",
    target: "[data-tg-title='friend_modal_trigger']",
  },
  {
    title: "amazing! last order of business is your subscription!",
    content:
      "once you've subscribed, your bulletin will be sent out to your recipients at the end of the month!",
  },
];
