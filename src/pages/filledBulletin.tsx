import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { Bulletin, getBulletin, updateBulletin } from "@/lib/api";
import ImageUploadGrid from "@/components/ImageUploadGrid";
import BlurbInput from "@/components/BlurbInput";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);

  const navigate = useNavigate();
  // Using useParams hook from react-router-dom to get URL parameters
  const params = useParams<{ slug?: string }>();
  // Access the slug parameter from the URL
  const slug = params;
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);

  console.log("URL Slug:", slug);

  const handleNewSubmission = () => {
    navigate("/bulletin");
  };

  const bulletin = user?.bulletins?.filter(
    (bulletin) => bulletin === slug.id
  )[0];

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
          savedNotes: Object.keys(data[0].saved_notes).map((item, index) => ({
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

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
        {bulletinData && (
          <ImageUploadGrid
            images={bulletinData?.images}
            setImages={(e) => {
              setBulletin({
                ...bulletinData,
                images: e,
              });
            }}
          />
        )}

        {bulletinData && (
          <BlurbInput
            savedNotes={bulletinData?.savedNotes}
            setSavedNotes={(e) => {
              setBulletin({
                ...bulletinData,
                savedNotes: e,
              });
            }}
            blurb={bulletinData?.blurb}
            setBlurb={(e) => setBulletin({ ...bulletinData, blurb: e })}
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
