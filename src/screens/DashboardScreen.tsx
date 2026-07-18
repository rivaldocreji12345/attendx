import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getSubjectsWithStats } from '@/database/services/attendanceService';
import type { RootState } from '@/store';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import type { SubjectWithStats } from '@/types/models';

function getAttendanceColor(percent: number): string {
  if (percent >= 85) return colors.primary;
  if (percent >= 75) return colors.secondary;
  if (percent >= 65) return colors.warning;
  return colors.error;
}

export function DashboardScreen() {
  const { t } = useTranslation();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getSubjectsWithStats()
        .then(setSubjects)
        .finally(() => setLoading(false));
    }, []),
  );

  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedPeriods, 0);
  const totalPeriods = subjects.reduce((sum, s) => sum + s.totalPeriods, 0);

  const overallPercent =
    totalPeriods === 0
      ? 0
      : Math.round((totalAttended / totalPeriods) * 100);

  const initials = profile
    ? profile.studentName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : 'ST';

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>UA</Text>
          </View>
          <Text style={styles.topBarTitle}>{t('appTitle')}</Text>
        </View>
        <View style={styles.semBadge}>
          <Text style={styles.semBadgeText}>
            {t('semester')} {profile?.semester ?? '–'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={18} color={colors.primary} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Summary Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.studentName ?? 'Student'}</Text>
            <Text style={styles.profileMeta}>
              Roll: {profile?.rollNumber ?? '–'} • {profile?.courseName ?? '–'}
            </Text>
          </View>
          <View style={styles.overallBadge}>
            <Text style={styles.overallLabel}>{t('overallAttendance')}</Text>
            <Text style={styles.overallPercent}>{overallPercent}%</Text>
          </View>
        </View>

        {/* Subject Performance */}
        <Text style={styles.sectionHeading}>{t('subjectPerformance')}</Text>

        {loading && (
          <ActivityIndicator
            accessibilityLabel="loading-subjects"
            color={colors.primary}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {!loading && subjects.length === 0 && (
          <View style={styles.emptyCard}>
            <MaterialIcons name="school" size={40} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>{t('noSubjectsFound')}</Text>
          </View>
        )}

        {subjects.map((subject) => {
          const isCritical = subject.attendancePercent < 75;
          const isWarning =
            subject.attendancePercent >= 75 && subject.attendancePercent < 80;
          return (
            <View
              key={subject.id}
              style={[styles.subjectCard, isCritical && styles.subjectCardCritical]}
            >
              {isCritical && (
                <View style={styles.actionTag}>
                  <Text style={styles.actionTagText}>Action Required</Text>
                </View>
              )}
              <View style={styles.subjectRow}>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectMeta}>
                    {t('attended')}: {subject.attendedPeriods} / {t('total')}: {subject.totalPeriods}{' '}
                    {t('periods', { defaultValue: 'periods' })}
                  </Text>
                  {isCritical && (
                    <View style={styles.warningRow}>
                      <MaterialIcons name="warning" size={12} color={colors.error} />
                      <Text style={styles.warningText}>{t('below75')}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.percentText,
                    { color: getAttendanceColor(subject.attendancePercent) },
                  ]}
                >
                  {subject.attendancePercent}%
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(subject.attendancePercent, 100)}%`,
                      backgroundColor: getAttendanceColor(subject.attendancePercent),
                    },
                  ]}
                />
              </View>
              {isWarning && (
                <Text style={styles.borderlineText}>{t('borderline')}</Text>
              )}
            </View>
          );
        })}

        {/* Summary footer */}
        {subjects.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalPeriods}</Text>
              <Text style={styles.summaryLabel}>{t('totalPeriods', { defaultValue: 'Total Periods' })}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalAttended}</Text>
              <Text style={styles.summaryLabel}>{t('attended')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: getAttendanceColor(overallPercent) }]}>
                {overallPercent}%
              </Text>
              <Text style={styles.summaryLabel}>{t('overallAttendance')}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.onPrimaryContainer,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '700',
  },
  topBarTitle: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  semBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  semBadgeText: {
    color: colors.primary,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  profileMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
  },
  overallBadge: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  overallLabel: {
    color: colors.onPrimary,
    fontFamily: typography.ui,
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 1,
  },
  overallPercent: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeading: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
    textAlign: 'center',
  },
  subjectCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  subjectCardCritical: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  actionTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: radii.md,
  },
  actionTagText: {
    color: colors.onError,
    fontFamily: typography.ui,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  subjectInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  subjectName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  subjectMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 11,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  warningText: {
    color: colors.error,
    fontFamily: typography.body,
    fontSize: 11,
  },
  percentText: {
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  borderlineText: {
    color: colors.secondary,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.sm,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.outlineVariant,
  },
});
