import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/redux";
import { staticGetUser } from "@/redux/user/selectors";
import { Bulletin, getBulletin } from "@/lib/api";
import BulletinPage from "./bulletin";

const FilledBulletin: React.FC = () => {
  const user = useAppSelector(staticGetUser);

  // Using useParams hook from react-router-dom to get URL parameters
  const { id } = useParams<{ id: string }>();
  const [bulletinData, setBulletin] = useState<Bulletin | null>(null);

  const bulletin = user?.bulletins?.find((bulletin) => bulletin === id);

  useEffect(() => {
    if (bulletin && bulletinData === null) {
      getBulletin(bulletin).then((data) => {
        console.log("::", data);
        console.log("::", data.saved_notes);
        const setData = {
          ...data,
          savedNotes: Object.keys(data.saved_notes).map((item) => ({
            date: new Date(structuredClone(item)),
            note: data.saved_notes[item],
          })),
          images: data.images.map((item) => ({
            id: item,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-standardized/${item}.png`,
          })),
        };
        setBulletin(data);
      });
    }
  }, [bulletin, bulletinData]);

  console.log("bulletinData", bulletinData);
  return <BulletinPage existingBulletin={bulletinData} />;
};

export default FilledBulletin;
