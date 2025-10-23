import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Bulletin, supabase } from "@/lib/api.ts";
import { RESET_ALL_SLICES } from "../constants.ts";
import { toast } from "sonner";

export type User = {
  id: number;
  firstName: string;
  images: string[];
  bulletins: string[];
  phone_number: string;
  address: string;
  recipients: string[];
  connections: string[];
};

export type UserState = {
  user: User | null;
  bulletins: Bulletin[] | null;
};

const initialState: UserState = {
  user: null,
  bulletins: [],
};

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (phoneNumber: string, { dispatch }) => {
    console.log("fetching user", phoneNumber);
    try {
      const { data: res, error } = await supabase
        .from("user_record")
        .select("*")
        .eq("phone_number", phoneNumber);

      console.log(res);

      const userResponse: User = res[0];

      dispatch(setUser(userResponse));

      return userResponse;
    } catch (error) {
      alert("Error fetching user");
      console.log(error);
      return null;
    }
  }
);

export const fetchAllBulletins = createAsyncThunk(
  "user/fetchAllBulletins",
  async (
    phoneNumber: string | null | undefined,
    { dispatch, getState }
  ): Promise<Bulletin[]> => {
    const state = getState() as { userUpdater: UserState };
    const user: User = state.userUpdater?.user;
    const { data: res, error } = await supabase
      .from("bulletins")
      .select("*")
      .eq("owner", user?.phone_number ?? phoneNumber);
    console.log(res);
    dispatch(setBulletins(res));
    return res;
  }
);

export const fetchBulletins = createAsyncThunk(
  "user/fetchBulletins",
  async (_, { dispatch, getState }) => {
    const state = getState() as { userUpdater: UserState };
    const user: User = state.userUpdater.user;
    console.log(getState());
    const { data: res, error } = await supabase
      .from("bulletins")
      .select("*")
      .in("id", user.bulletins);
    console.log(res);
    dispatch(setBulletins(res));
  }
);

export const updateSavedNotes = createAsyncThunk(
  "user/updateSavedNotes",
  async (bulletin: Partial<Bulletin>, { dispatch }) => {
    try {
      console.log(bulletin.saved_notes);
      const { error, data: res } = await supabase
        .from("bulletins")
        .update({ saved_notes: bulletin.saved_notes })
        .eq("id", bulletin.id)
        .select("*")
        .then((res) => {
          console.log(res.data);
          dispatch(updateBulletin(res.data[0]));
          return res;
        });

      if (error) {
        console.error("Error updating saved notes:", error);
        return error;
      }
      toast.success("Date saved!");
      return { success: true, data: res[0].data };
    } catch (error) {
      console.error("Error updating saved notes:", error);
      return error;
    }
  }
);

export const updateTemplate = createAsyncThunk(
  "user/updateTemplate",
  async (bulletin: Partial<Bulletin>, { dispatch }) => {
    try {
      console.log(bulletin.template);
      const { error, data: res } = await supabase
        .from("bulletins")
        .update({ template: bulletin.template })
        .eq("id", bulletin.id)
        .select("*")
        .then((res) => {
          console.log(res.data);
          dispatch(updateBulletin(res.data[0]));
          return res;
        });

      if (error) {
        console.error("Error updating saved notes:", error);
        return error;
      }
      toast.success("Template saved!");
      return { success: true, data: res[0].data };
    } catch (error) {
      console.error("Error updating saved notes:", error);
      return error;
    }
  }
);

export const updateBlurb = createAsyncThunk(
  "user/updateBlurb",
  async (bulletin: Partial<Bulletin>, { dispatch }) => {
    try {
      console.log(bulletin.blurb);
      const { error, data: res } = await supabase
        .from("bulletins")
        .update({ blurb: bulletin.blurb })
        .eq("id", bulletin.id)
        .select("*")
        .then((res) => {
          dispatch(updateBulletin(res.data[0]));
          return res;
        });

      if (error) {
        console.error("Error updating saved notes:", error);
        return error;
      }
      toast.success("Template saved!");
      return { success: true, data: res[0].data };
    } catch (error) {
      console.error("Error updating saved notes:", error);
      return error;
    }
  }
);

export const userUpdater = createSlice({
  name: "userUpdater",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setBulletins: (state, action: PayloadAction<Bulletin[]>) => {
      state.bulletins = action.payload;
    },
    updateBulletin: (state, action: PayloadAction<Bulletin>) => {
      state.bulletins = state.bulletins?.map((bulletin) =>
        bulletin.id === action.payload.id ? action.payload : bulletin
      );
    },
    addBulletin: (state, action: PayloadAction<Bulletin>) => {
      state.bulletins = [...state.bulletins, action.payload];
      state.user = {
        ...state.user,
        bulletins: [...state.user.bulletins, action.payload.id],
      };
    },
    updateSavedNotes: (state, action: PayloadAction<Bulletin>) => {
      state.bulletins = state.bulletins?.map((bulletin) =>
        bulletin.id === action.payload.id ? action.payload : bulletin
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(RESET_ALL_SLICES, () => initialState);
  },
});

export const { setUser, setBulletins, addBulletin, updateBulletin } =
  userUpdater.actions;

export default userUpdater.reducer;
