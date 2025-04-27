import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { Bulletin, getBulletin, updateBulletin } from "@/lib/api";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput, { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);
  const navigate = useNavigate();
  
  const { id } = useParams<{ id: string }>();
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);

  console.log("URL Slug:", id);

  const handleNewSubmission = () => {
    navigate("/bulletin");
  };

  const bulletin = user?.bulletins?.find(bulletin => bulletin === id);

  useEffect(() => {
    if (bulletin && bulletinData === null) {
      console.log(bulletin);
      getBulletin(bulletin).then((data) => {
        console.log(data[0].saved_notes);
        console.log(
          Object.keys(data[0].saved_notes).map((item, index) => ({
            date: item,
            note: data[0].saved_notes[item],
          }))
        );
        const setData = {
          ...data[0],
          savedNotes: Object.keys(data[0].saved_notes).map((item) => ({
            date: new Date(item),
            note: data[0].saved_notes[item],
          })),
          images: data[0].images.map((item) => ({
            id: item,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images//${item}.png`,
          })),
        };
        setBulletin(setData);
      });
    }
  }, [bulletin, bulletinData]);

  const setImages = (newImages: UploadedImage[]) => {
    if (bulletinData) {
      setBulletin({
        ...bulletinData,
        images: Array.isArray(newImages) ? newImages : bulletinData.images,
      });
    }
  };

  const setSavedNotes = (newNotes: CalendarNote[]) => {
    if (bulletinData) {
      setBulletin({
        ...bulletinData,
        savedNotes: Array.isArray(newNotes) ? newNotes : bulletinData.savedNotes,
      });
    }
  };

  const setBlurb = (newBlurb: string) => {
    if (bulletinData) {
      setBulletin({
        ...bulletinData,
        blurb: typeof newBlurb === 'string' ? newBlurb : bulletinData.blurb,
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        {bulletinData && (
          <ImageUploadGrid
            images={bulletinData.images}
            setImages={setImages}
          />
        )}

        {bulletinData && (
          <BlurbInput
            savedNotes={bulletinData.savedNotes}
            setSavedNotes={setSavedNotes}
            blurb={bulletinData.blurb}
            setBlurb={setBlurb}
            images={bulletinData.images}
            setImages={setImages}
          />
        )}

        <Button
          onClick={() => updateBulletin(user, bulletinData)}
          size="lg"
          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium"
        >
          <Sparkles className="mr-2" />
          Update your Bulletin
        </Button>
      </div>
    </Layout>
  );
};

export default FilledBulletin;
