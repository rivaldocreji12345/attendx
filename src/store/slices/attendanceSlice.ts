import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AttendanceStatus } from '@/types/models';

type AttendanceState = {
  selectedClassId: number | null;
  selectedDate: string;
  pendingMarks: Record<number, AttendanceStatus>;
};

const initialState: AttendanceState = {
  selectedClassId: null,
  selectedDate: new Date().toISOString().split('T')[0],
  pendingMarks: {},
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSelectedClass(state, action: PayloadAction<number | null>) {
      state.selectedClassId = action.payload;
    },
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
    },
    markStudent(
      state,
      action: PayloadAction<{ studentId: number; status: AttendanceStatus }>,
    ) {
      state.pendingMarks[action.payload.studentId] = action.payload.status;
    },
    clearMarks(state) {
      state.pendingMarks = {};
    },
  },
});

export const { setSelectedClass, setSelectedDate, markStudent, clearMarks } = attendanceSlice.actions;
export default attendanceSlice.reducer;
