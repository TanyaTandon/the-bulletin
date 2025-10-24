import { CalendarNote } from "@/components/BlurbInput";
import { UploadedImage } from "@/components/ImageUploadGrid";
import sendError from "@/hooks/use-sendError";
import { addBulletin, User } from "@/redux/user";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { arrayToDict } from "./utils";

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
  template: number;
  month: number;
};

export type NewBulletinItem = {
  user: User;
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
      recipients: [],
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

export async function getBulletin(bulletinId: string): Promise<Bulletin> {
  const { data, error } = await supabase
    .from("bulletins")
    .select("*")
    .eq("id", bulletinId);
  return data[0] as Bulletin;
}

export async function getAllBulletins(user: User) {
  const { data, error } = await supabase
    .from("bulletins")
    .select("*")
    .eq("owner", user.phone_number);

  if (error) {
    console.error("Error getting all bulletins:", error);
    throw error;
  }

  return data;
}

export async function updateBulletin(user: User, bulletin: Bulletin) {
  try {
    const images = bulletin.images;
    // Upload images to the bucket and collect their URLs
    const imageUrls: string[] = [];

    for (const image of images) {
      if (!image.url.includes("supabase.co")) {
        // Only process images that haven't been uploaded to Supabase yet
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
    }

    function arrayToDict(arr) {
      return arr.reduce((dict, item) => {
        // Convert Date objects to ISO strings for storage
        const dateKey =
          item.date instanceof Date
            ? item.date.toISOString()
            : item.date.toString();

        dict[dateKey] = item.note;
        return dict;
      }, {});
    }

    const updatedBulletin = {
      blurb: bulletin.blurb,
      images: images.map((item) => item.id),
      saved_notes: arrayToDict(bulletin.savedNotes),
    };

    console.log("Updating bulletin with data:", updatedBulletin);
    console.log("Bulletin ID:", bulletin.id);

    const { error: bulletinError, data: bulletinData } = await supabase
      .from("bulletins")
      .update(updatedBulletin)
      .eq("id", bulletin.id)
      .select();

    if (bulletinError) {
      console.error("Error updating bulletin:", bulletinError);
      throw bulletinError;
    }

    // Update user's images array if new images were added
    const newImageIds = images
      .map((item) => item.id)
      .filter((id) => !user.images.includes(id));
    if (newImageIds.length > 0) {
      const { error: userError } = await supabase
        .from("user_record")
        .update({
          images: [...newImageIds, ...user.images],
        })
        .eq("phone_number", user.phone_number);

      if (userError) {
        console.error("Error updating user images:", userError);
        throw userError;
      }
    }

    return { success: true, bulletinId: bulletin.id, bulletinData };
  } catch (error) {
    console.error("Error in updateBulletin:", error);
    return { success: false, error };
  }
}

export async function addFriendToSupabase({
  friend,
  fractionalUser,
  user,
  fractionalData,
}) {
  if (fractionalUser == -1) {
    return await supabase
      .from("fractional_user_record")
      .insert({
        id: friend.phone_number,
        suggested_name: [friend.name],
        suggested_addresses: [friend.address],
        added_by: [user.phone_number],
      })
      .then(async () => {
        const userData = await supabase
          .from("user_record")
          .update({
            recipients: [...user.recipients, friend.phone_number],
          })
          .eq("phone_number", user.phone_number)
          .select();

        return userData.data as User[];
      });
  } else if (fractionalUser == 0) {
    return await supabase
      .from("fractional_user_record")
      .update({
        added_by: [...fractionalData.added_by, user.phone_number],
      })
      .eq("id", friend.phone_number)
      .then(async () => {
        const userData = await supabase
          .from("user_record")
          .update({
            recipients: [...user.recipients, friend.phone_number],
          })
          .eq("phone_number", user.phone_number)
          .select();

        return userData.data as User[];
      });
  } else if (fractionalUser == 1) {
    const userData = await supabase
      .from("user_record")
      .update({
        recipients: [...user.recipients, friend.phone_number],
      })
      .eq("phone_number", user.phone_number)
      .select();

    return userData.data as User[];
  }
}

export async function removeRecipient({
  user,
  recipient,
}: {
  user: User;
  recipient: string;
}) {
  const { error: userError, data: userData } = await supabase
    .from("user_record")
    .update({
      recipients: user.recipients.filter((item) => item !== recipient),
    })
    .eq("phone_number", user.phone_number)
    .select();

  if (userError) {
    console.error("Error removing recipient:", userError);
    throw userError;
  }
  return userData;
}

export async function submitFeedback(feedback: {
  user: string;
  feedback: string;
}) {
  const { error: feedbackError } = await supabase
    .from("user_feedback")
    .insert(feedback);

  if (feedbackError) {
    console.error("Error submitting feedback:", feedbackError);
    throw feedbackError;
  }

  return { success: true };
}

export async function connectWithFriendRequest({
  user,
  friendId,
}: {
  user: User;
  friendId: string;
}) {
  try {
    await supabase
      .rpc("append_to_connections", {
        user_id: user.id,
        new_connection: friendId,
      })
      .then(async () => {
        await supabase.rpc("append_to_connections", {
          user_id: friendId,
          new_connection: user.id,
        });
      });
  } catch (error) {
    console.error("Error in connectWithFriendRequest:", error);
    return { success: false, error };
  }
}

export async function getForeignUserImages(id: string) {
  const { data, error } = await supabase
    .from("user_record")
    .select("images")
    .eq("id", id);

  if (error) {
    console.error("Error getting foreign user images:", error);
    throw error;
  }
  return data;
}

export async function uploadImage()

export const createNewBulletin = createAsyncThunk(
  "user/createNewBulletin",
  async ({ user }: NewBulletinItem, { dispatch }) => {
    try {
      let newUserData: User;
      // Create a new bulletin item with UUID

      let createdBulletin: Bulletin;

      const { error: bulletinError } = await supabase
        .from("bulletins")
        .insert({
          blurb: "",
          images: [],
          owner: user.phone_number,
          saved_notes: [],
          template: 0,
          month: new Date().getMonth() + 1,
        })
        .select("*")
        .then(async (item) => {
          console.log("::*", item);
          console.log("OG Created Bulletin:", item);
          try {
            if (item.data) {
              createdBulletin = [item.data[0]][0] as unknown as Bulletin;
            }

            const { data: userData, error: userError } = await supabase
              .from("user_record")
              .update({
                bulletins: [createdBulletin.id, ...user.bulletins],
              })
              .eq("phone_number", user.phone_number)
              .select("*");

            console.log("Created bulletin:", createdBulletin);
            dispatch(addBulletin(createdBulletin));
            console.log("User data:", userData);
            newUserData = userData as unknown as User;
            if (userError) {
              console.error("Error creating user:", userError);
              sendError(user.phone_number, "createNewBulletin", userError, {
                id: createdBulletin.id,
                blurb: "",
                images: [],
              });
              throw userError;
            }
            return item;
          } catch (error) {
            sendError(user.phone_number, "createNewBulletin", error, {
              id: createdBulletin.id,
              blurb: "",
              images: [],
            });
            console.error("Error creating user:", error);
          }
        });

      if (bulletinError) {
        sendError(user.phone_number, "insertBulletin", bulletinError, {
          id: createdBulletin.id,
          blurb: "",
          images: [],
          owner: user.phone_number,
          saved_notes: "",
        });
        console.error("Error creating bulletin:", bulletinError);
        throw bulletinError;
      }

      const bulletinId = createdBulletin.id;
      console.log("::*", { success: true, bulletinId, newUserData });
      return { success: true, bulletinId, newUserData };
    } catch (error) {
      console.error("Error in createNewUser:", error);
      return { success: false, error };
    }
  }
);
