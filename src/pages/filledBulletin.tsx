import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/redux";
import { getStaticBulletin, staticGetUser } from "@/redux/user/selectors";
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
        const setData = {
          ...data,
          images: data.images.map((item) => ({
            id: item.id,
            url: `https://voiuicuaujbhkkljtjfw.supabase.co/storage/v1/object/public/user-images-standardized/${item}.jpeg`,
          })),
        };
        setBulletin(setData);
      });
    }
  }, [bulletin, bulletinData]);

  const bulletinFromRedux = useAppSelector((state) =>
    getStaticBulletin(state, id)
  );
  useEffect(() => {
    if (bulletinFromRedux && bulletinData !== null) {
      setBulletin(bulletinFromRedux);
    }
  }, [bulletinFromRedux]);

  console.log("bulletinData", bulletinData);
  return <BulletinPage existingBulletin={bulletinData} />;
};

export default FilledBulletin;
