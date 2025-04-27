
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
import { toast } from "sonner";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);
  const navigate = useNavigate();
  
  // Using useParams hook from react-router-dom to get URL parameters
  const { id } = useParams<{ id: string }>();
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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

  // Create type-safe setter functions to work with ImageUploadGrid and BlurbInput components
  const setImages = (newImages: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => {
    if (bulletinData) {
      if (typeof newImages === 'function') {
        const updatedImages = newImages(bulletinData.images);
        setBulletin({
          ...bulletinData,
          images: updatedImages,
        });
      } else {
        setBulletin({
          ...bulletinData,
          images: newImages,
        });
      }
    }
  };

  const setSavedNotes = (newNotes: CalendarNote[] | ((prev: CalendarNote[]) => CalendarNote[])) => {
    if (bulletinData) {
      if (typeof newNotes === 'function') {
        const updatedNotes = newNotes(bulletinData.savedNotes);
        setBulletin({
          ...bulletinData,
          savedNotes: updatedNotes,
        });
      } else {
        setBulletin({
          ...bulletinData,
          savedNotes: newNotes,
        });
      }
    }
  };

  const setBlurb = (newBlurb: string | ((prev: string) => string)) => {
    if (bulletinData) {
      if (typeof newBlurb === 'function') {
        const updatedBlurb = newBlurb(bulletinData.blurb);
        setBulletin({
          ...bulletinData,
          blurb: updatedBlurb,
        });
      } else {
        setBulletin({
          ...bulletinData,
          blurb: newBlurb,
        });
      }
    }
  };

  const handleUpdateBulletin = async () => {
    if (!user || !bulletinData) return;
    
    setIsUpdating(true);
    try {
      const result = await updateBulletin(user, bulletinData);
      if (result.success) {
        toast.success("Bulletin updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        toast.error("Failed to update bulletin");
      }
    } catch (error) {
      console.error("Error updating bulletin:", error);
      toast.error("An error occurred while updating your bulletin");
    } finally {
      setIsUpdating(false);
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
          onClick={handleUpdateBulletin}
          size="lg"
          className="bg-gradient-to-r from-accent to-primary hover:opacity-90 font-medium"
          disabled={isUpdating}
        >
          {isUpdating ? (
            "Updating..."
          ) : (
            <>
              <Sparkles className="mr-2" />
              Update your Bulletin
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
};

export default FilledBulletin;
