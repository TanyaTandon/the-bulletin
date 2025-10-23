import React, { ReactNode, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Heart, LoaderCircle } from "lucide-react";
import { format, isBefore, isAfter } from "date-fns";
import { CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { UploadedImage } from "./ImageUploadGrid";
import NewImageUploadGrid from "./NewUploadImageGrid";
import MonthlyTimer from "./MonthlyTimer";
import { EditState, templates } from "@/pages/bulletin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Checkbox } from "./ui/checkbox";
import { staticGetUser } from "@/redux/user/selectors";
import { useAppSelector } from "@/redux";

export interface CalendarNote {
  date: Date;
  note: string;
  example?: boolean;
}

interface BlurbInputProps {
  savedNotes: CalendarNote[];
  setSavedNotes: React.Dispatch<React.SetStateAction<CalendarNote[]>>;
  blurb: string;
  setBlurb: React.Dispatch<React.SetStateAction<string>>;
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  placeholder?: string;
  isSubmitting: boolean;
  handleSubmitBulletin: () => void;
  editState: EditState;
  selectedTemplate: { id: string; name: string; images: number };
  setSelectedTemplate: React.Dispatch<
    React.SetStateAction<{ id: string; name: string; images: number }>
  >;
}

const MAX_CHARS = 365;

const BlurbInput: React.FC<BlurbInputProps> = ({
  savedNotes,
  setSavedNotes,
  blurb,
  setBlurb,
  images,
  setImages,
  placeholder,
  editState,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  const isMobile = useIsMobile();

  const handleBlurbChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text?.length <= MAX_CHARS) {
      setBlurb(text);
    }
  };

  const user = useAppSelector(staticGetUser);

  console.log(user);

  return (
    <section
      data-tg-title="Image Housing"
      className="flex flex-col items-center space-y-8 w-full mt-3 pt-7"
    >
      <div className=" flex w-full justify-between">
        {editState === EditState.IMAGES && (
          <div className="mb-6">
            <h1 className="mb-2 text-left">Images</h1>
            <NewImageUploadGrid
              images={images}
              setImages={setImages}
              imageMax={selectedTemplate.images}
            />
          </div>
        )}
        {editState === EditState.BLURB && (
          <section className="w-full mt-3">
            <h1 className="mb-2 text-left">Blurb</h1>
            <div className="relative w-full flex flex-col items-end">
              <Textarea
                value={blurb}
                onChange={handleBlurbChange}
                placeholder={
                  placeholder ||
                  "e.g. April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. I'm trying to build a cult of people who don't sleep with their phones in their rooms — and honestly, I'm kinda succeeding. I am terrified of all the FUN that May will bring!!"
                }
                className={`resize-none w-full max-w-3xl border-violet-200 bg-[#fcffef] focus:border-violet-400 focus:ring-violet-400 text-sm ${
                  isMobile ? "min-h-[250px]" : "min-h-[300px]"
                }`}
                maxLength={MAX_CHARS}
              />
              <div className="text-xs text-gray-500 text-right mt-2">
                {blurb?.length ?? 0}/{MAX_CHARS} characters
              </div>
            </div>
          </section>
        )}
      </div>
      {editState == EditState.TEMPLATE && (
        <section className="w-full text-left">
          <h1>Layouts</h1>
          <Accordion type="multiple">
            {templates.map((template) => (
              <AccordionItem value={template.id.toString()}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTemplate.id === template.id}
                      onCheckedChange={(e) => {
                        console.log("template", template);
                        setSelectedTemplate(template);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {template.name}
                  </div>
                </AccordionTrigger>
                <AccordionContent
                  className={`data-[state=${
                    selectedTemplate.id === template.id ? "open" : "closed"
                  }]`}
                >
                  <div>{template.description}</div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </section>
  );
};

export default BlurbInput;
