import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SettingsState = {
  language: 'en' | 'hi';
  requireBiometric: boolean;
};

const initialState: SettingsState = {
  language: 'en',
  requireBiometric: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<'en' | 'hi'>) {
      state.language = action.payload;
    },
    setRequireBiometric(state, action: PayloadAction<boolean>) {
      state.requireBiometric = action.payload;
    },
  },
});

export const { setLanguage, setRequireBiometric } = settingsSlice.actions;
export default settingsSlice.reducer;
