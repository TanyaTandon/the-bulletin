import { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";
import { User } from "@/redux/user";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export const supabase = createClient(
  "https://voiuicuaujbhkkljtjfw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXVpY3VhdWpiaGtrbGp0amZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQxNzYwMSwiZXhwIjoyMDU5OTkzNjAxfQ.6OC835cAwInmVOpG2yJknezG1RUQnOMT0tAlewWFv5E"
);

export type NewUserItem = {
  name: string;
  id: string;
  created_user_id: string;
  phoneNumber: string;
  fullAddress: string;
};

export type Bulletin = {
  id?: string;
  blurb: string;
  images: UploadedImage[];
  owner: string;
  savedNotes: CalendarNote[];
};

export type NewBulletinItem = {
  user: User;
  bulletin: Bulletin;
};

export async function createNewUser({
  name,
  id,
  created_user_id,
  phoneNumber,
  fullAddress,
}: NewUserItem) {
  try {

    // Create a new user with combined address
    const { error: userError } = await supabase.from("user_record").insert({
      created_user_id: created_user_id,
      id: created_user_id,
      firstName: name,
      images: [],
      bulletins: [],
      phone_number: phoneNumber,
      address: fullAddress,
    });

    if (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }

    return { success: true, userId: created_user_id };
  } catch (error) {
    console.error("Error in createNewUser:", error);
    return { success: false, error };
  }
}

export async function createNewBulletin({ user, bulletin }: NewBulletinItem) {
  try {
    const images = bulletin.images;
    // Upload images to the bucket and collect their URLs
    const imageUrls: string[] = [];

    for (const image of images) {
      const fetchBlob = await fetch(image.url, {
        method: "GET",
        headers: {
          Accept: "image/png",
        },
      });

      const buff = await fetchBlob.blob();

      const { data: fileData, error: uploadError } = await supabase.storage
        .from("user-images")
        .upload(`/${image.id}.png`, buff, {
          contentType: "image/png",
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        continue;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from("user-images")
        .getPublicUrl(image.id);

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }

    function arrayToDict(arr) {
      return arr.reduce((dict, item) => {
        dict[item.date] = item.note;
        return dict;
      }, {});
    }

    let returnBulletin: Bulletin[] = [];

    // Create a new bulletin item with UUID
    const bulletinId = uuidv4();
    const { error: bulletinError } = await supabase
      .from("bulletins")
      .insert({
        id: bulletinId,
        blurb: bulletin.blurb,
        images: images.map((item) => item.id),
        owner: user.phone_number,
        saved_notes: arrayToDict(bulletin.savedNotes),
      })
      .then(async (item) => {
        if (item.data) {
          returnBulletin = [item.data[0]];
        }

        const { error: userError } = await supabase
          .from("user_record")
          .update({
            images: [...images.map((item) => item.id), ...user.images],
            bulletins: [bulletinId, ...user.bulletins],
          })
          .eq("phone_number", user.phone_number);

        if (userError) {
          console.error("Error creating user:", userError);
          throw userError;
        }
        return item;
      });

    if (bulletinError) {
      console.error("Error creating bulletin:", bulletinError);
      throw bulletinError;
    }

    return { success: true, bulletinId };
  } catch (error) {
    console.error("Error in createNewUser:", error);
    return { success: false, error };
  }
}
