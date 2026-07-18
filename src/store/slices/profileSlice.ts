import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Profile } from '@/types/models';

type ProfileState = {
  profile: Profile | null;
  isLoaded: boolean;
};

const initialState: ProfileState = {
  profile: null,
  isLoaded: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
      state.isLoaded = true;
    },
    clearProfile(state) {
      state.profile = null;
      state.isLoaded = true;
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
