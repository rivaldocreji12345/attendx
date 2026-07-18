import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authenticateUser } from '@/auth/localAuth';
import { upsertAttendanceRecord } from '@/database/services/attendanceService';
import { MarkAttendanceButton } from '@/components/MarkAttendanceButton';
import { markStudent } from '@/store/slices/attendanceSlice';
import type { AppDispatch, RootState } from '@/store';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import { getTodayISODate } from '@/utils/date';

const DEMO_STUDENT_ID = 1;
const DEMO_CLASS_ID = 1;

export function HomeScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const pendingMarks = useSelector((state: RootState) => state.attendance.pendingMarks);
  const [saving, setSaving] = useState(false);

  async function markAttendance(status: 'present' | 'absent') {
    setSaving(true);
    const isAuthorized = await authenticateUser(t('authPrompt'));

    if (!isAuthorized) {
      Alert.alert(t('authFailed'));
      setSaving(false);
      return;
    }

    const date = getTodayISODate();
    dispatch(markStudent({ studentId: DEMO_STUDENT_ID, status }));
    await upsertAttendanceRecord(DEMO_STUDENT_ID, DEMO_CLASS_ID, date, status);
    setSaving(false);
  }

  const recordCount = Object.keys(pendingMarks).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('appTitle')}</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('todaySummary')}</Text>
        <Text style={styles.cardBody}>
          {t('records')}: {recordCount}
        </Text>
      </View>
      <View style={styles.actions}>
        <MarkAttendanceButton
          accessibilityLabel="mark-present-button"
          label={saving ? `${t('markPresent')}...` : t('markPresent')}
          onPress={() => markAttendance('present')}
          variant="present"
        />
        <MarkAttendanceButton
          accessibilityLabel="mark-absent-button"
          label={saving ? `${t('markAbsent')}...` : t('markAbsent')}
          onPress={() => markAttendance('absent')}
          variant="absent"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.heading,
    fontSize: 28,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: typography.ui,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  cardBody: {
    color: colors.textSecondary,
    fontFamily: typography.body,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
