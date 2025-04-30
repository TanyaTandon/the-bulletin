import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Bulletin, supabase } from "@/lib/api.ts";

export type User = {
  id: number;
  firstName: string;
  images: string[];
  bulletins: string[];
  phone_number: string;
  address: string;
  recipients: string[];
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
  },
});

export const { setUser, setBulletins } = userUpdater.actions;

export default userUpdater.reducer;
