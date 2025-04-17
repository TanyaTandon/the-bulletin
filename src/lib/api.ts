import { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  "https://voiuicuaujbhkkljtjfw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaXVpY3VhdWpiaGtrbGp0amZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQxNzYwMSwiZXhwIjoyMDU5OTkzNjAxfQ.6OC835cAwInmVOpG2yJknezG1RUQnOMT0tAlewWFv5E"
);

export type NewUserItem = {
  name: string;
  id: string;
  created_user_id: string;
  blurb: string;
  images: UploadedImage[];
  phoneNumber: string;
  savedNotes: CalendarNote[];
};

export default async function createNewUser({
  name,
  id,
  created_user_id,
  blurb,
  images,
  phoneNumber,
  savedNotes,
}: NewUserItem) {
  try {
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

      console.log(buff);

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

    // Create a new bulletin item with UUID
    const bulletinId = uuidv4();
    const { error: bulletinError } = await supabase.from("bulletins").insert({
      id: bulletinId,
      blurb: blurb,
      images: images.map((item) => item.id),
      owner: phoneNumber,
    });

    if (bulletinError) {
      console.error("Error creating bulletin:", bulletinError);
      throw bulletinError;
    }

    function arrayToDict(arr) {
      return arr.reduce((dict, item) => {
        dict[item.date] = item.note;
        return dict;
      }, {});
    }

    // Create a new user
    const { error: userError } = await supabase.from("user_record").insert({
      id: created_user_id,
      firstName: name,
      images: images.map((item) => item.id),
      bulletins: [bulletinId],
      phone_number: phoneNumber,
      saved_notes: arrayToDict(savedNotes),
    });

    if (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }

    return { success: true, userId: created_user_id, bulletinId };
  } catch (error) {
    console.error("Error in createNewUser:", error);
    return { success: false, error };
  }
}
