import attendanceReducer, {
  clearMarks,
  markStudent,
  setSelectedClass,
} from '@/store/slices/attendanceSlice';

describe('attendanceSlice', () => {
  it('sets selected class id', () => {
    const state = attendanceReducer(undefined, setSelectedClass(4));
    expect(state.selectedClassId).toBe(4);
  });

  it('marks and clears student attendance', () => {
    const marked = attendanceReducer(
      undefined,
      markStudent({ studentId: 10, status: 'present' }),
    );

    expect(marked.pendingMarks[10]).toBe('present');

    const cleared = attendanceReducer(marked, clearMarks());
    expect(cleared.pendingMarks).toEqual({});
  });
});
