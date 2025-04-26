import { PayloadAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/lib/api.ts";

export type User = {
  id: number;
  firstName: string;
  images: string[];
  bulletins: string[];
  phone_number: string;
  address: string;
};

export type UserState = {
  user: User | null;
};

const initialState: UserState = {
  user: null,
};

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (phoneNumber: string, { dispatch }) => {
    try {
      const { data: res, error } = await supabase
        .from("user_record")
        .select("*")
        .eq("phone_number", phoneNumber);

      console.log(res);

      dispatch(setUser(res[0]));
      return res[0];
    } catch (error) {
      alert("Error fetching user");
      console.log(error);
      return null;
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
  },
});

export const { setUser } = userUpdater.actions;

export default userUpdater.reducer;
