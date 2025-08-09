import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import {
  Bulletin,
  getBulletin,
  submitFeedback,
  updateBulletin,
} from "@/lib/api";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import FriendModalContent from "@/components/FriendModalContent";
import TypewriterText from "@/components/TypewriterText";
import axios from "axios";
import FeedbackCard from "@/components/FeedbackContent";
import BulletinPage from "./bulletin";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [feedback, setFeedback] = useState<string>("");

  // Using useParams hook from react-router-dom to get URL parameters
  const { id } = useParams<{ id: string }>();
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Custom placeholder for the blurb textarea
  const customPlaceholder =
    "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";

  console.log("URL Slug:", bulletinData, user);

  const bulletin = user?.bulletins?.find((bulletin) => bulletin === id);

  useEffect(() => {
    if (bulletin && bulletinData === null) {
      getBulletin(bulletin).then((data) => {
        console.log(data[0].saved_notes);
        console.log(
          Object.keys(data[0].saved_notes[Object.keys(data[0].saved_notes)[0]])
        );
        const setData = {
          ...data[0],
          savedNotes: Object.keys(data[0].saved_notes).map((item) => ({
            date: new Date(structuredClone(item)),
            note: data[0].saved_notes[item],
          })),
          images: data[0].images.map((item) => ({
            id: item,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-original/${item}.png`,
          })),
        };
        setBulletin(setData);
      });
    }
  }, [bulletin, bulletinData]);

  console.log("Bulletin data:", user);

  return <BulletinPage existingBulletin={bulletinData} />;
};

export default FilledBulletin;
