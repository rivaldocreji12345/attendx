import { fireEvent, render } from '@testing-library/react-native';
import { MarkAttendanceButton } from '@/components/MarkAttendanceButton';

describe('MarkAttendanceButton', () => {
  it('handles press interactions', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <MarkAttendanceButton
        accessibilityLabel="mark-present-button"
        label="Mark Present"
        onPress={onPress}
        variant="present"
      />,
    );

    fireEvent.press(getByLabelText('mark-present-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
