import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

type MarkAttendanceButtonProps = {
  label: string;
  accessibilityLabel: string;
  variant: 'present' | 'absent';
  onPress: () => void;
};

export function MarkAttendanceButton({
  label,
  accessibilityLabel,
  variant,
  onPress,
}: MarkAttendanceButtonProps) {
  const backgroundColor = variant === 'present' ? colors.success : colors.danger;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[styles.button, { backgroundColor }]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    minWidth: 140,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    color: '#fff',
    fontFamily: typography.ui,
    fontSize: 14,
    textAlign: 'center',
  },
});
