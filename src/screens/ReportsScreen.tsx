import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
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

function getProgressColor(percent: number): string {
  if (percent >= 85) return colors.primary;
  if (percent >= 75) return colors.secondary;
  if (percent >= 65) return colors.warning;
  return colors.error;
}

export function ReportsScreen() {
  const { t } = useTranslation();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSubjectsWithStats().then(setSubjects);
    }, []),
  );

  const totalSessions = subjects.reduce((sum, s) => sum + s.totalSessions, 0);
  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedSessions, 0);
  const overallPercent =
    totalSessions === 0 ? 0 : Math.round((totalAttended / totalSessions) * 100 * 10) / 10;

  const hasCritical = subjects.some((s) => s.attendancePercent < 75);

  function handleDownloadPDF() {
    Alert.alert(t('pdfNotAvailable'));
  }

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
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Student header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{profile?.studentName ?? 'Student'}</Text>
            <Text style={styles.studentMeta}>
              {profile?.courseName ?? '–'} • Roll: {profile?.rollNumber ?? '–'}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="download-pdf"
            onPress={handleDownloadPDF}
            style={styles.downloadBtn}
          >
            <MaterialIcons name="download" size={18} color={colors.primary} />
            <Text style={styles.downloadBtnText}>{t('downloadPDF')}</Text>
          </Pressable>
        </View>

        {/* Overall Attendance card */}
        <View style={styles.overallCard}>
          <View>
            <Text style={styles.overallTitle}>{t('overallAttendance')}</Text>
            <Text style={styles.overallPercent}>{overallPercent}%</Text>
          </View>
          <View style={styles.overallStats}>
            <Text style={styles.overallStatLabel}>{t('totalClasses')}:</Text>
            <Text style={styles.overallStatValue}>{totalSessions}</Text>
            <Text style={[styles.overallStatLabel, { marginTop: 4 }]}>
              {t('attendedSlash')}:
            </Text>
            <Text style={styles.overallStatValue}>{totalAttended}</Text>
          </View>
        </View>

        {/* Critical warning banner */}
        {hasCritical && (
          <View style={styles.warningBanner}>
            <MaterialIcons name="warning" size={20} color={colors.error} />
            <View style={styles.warningBannerText}>
              <Text style={styles.warningBannerTitle}>{t('criticalShortage')}</Text>
              <Text style={styles.warningBannerDesc}>{t('criticalShortageDesc')}</Text>
            </View>
          </View>
        )}

        {/* Subject Breakdown */}
        <Text style={styles.sectionHeading}>{t('subjectBreakdown')}</Text>

        {subjects.map((subject) => {
          const isCritical = subject.attendancePercent < 75;
          const isBorderline =
            subject.attendancePercent >= 75 && subject.attendancePercent < 80;
          const sessionsShort =
            isCritical
              ? Math.max(0, 3 * subject.absentSessions - subject.attendedSessions)
              : 0;

          return (
            <View
              key={subject.id}
              style={[styles.subjectCard, isCritical && styles.subjectCardCritical]}
            >
              <View style={styles.subjectHeader}>
                <View style={styles.subjectTitleBlock}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  {isCritical && (
                    <View style={styles.actionReqTag}>
                      <Text style={styles.actionReqText}>ACTION REQ</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.subjectPercent,
                    { color: getProgressColor(subject.attendancePercent) },
                  ]}
                >
                  {subject.attendancePercent}%
                </Text>
              </View>

              <Text style={styles.subjectMeta}>
                {t('attended')}: {subject.attendedSessions} / {subject.totalSessions} {t('sessions')}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(subject.attendancePercent, 100)}%` as `${number}%`,
                      backgroundColor: getProgressColor(subject.attendancePercent),
                    },
                  ]}
                />
              </View>

              {isCritical && (
                <Text style={styles.shortByText}>
                  {t('shortBy')} {sessionsShort} {t('sessions')}
                </Text>
              )}
              {isBorderline && (
                <Text style={styles.borderlineText}>{t('borderline')}</Text>
              )}
            </View>
          );
        })}
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
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  studentMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  downloadBtnText: {
    color: colors.primary,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
  },
  overallCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  overallTitle: {
    color: colors.primaryFixedDim,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  overallPercent: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 40,
    fontWeight: '700',
  },
  overallStats: {
    alignItems: 'flex-end',
  },
  overallStatLabel: {
    color: colors.primaryFixedDim,
    fontFamily: typography.body,
    fontSize: 11,
  },
  overallStatValue: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  warningBannerText: {
    flex: 1,
  },
  warningBannerTitle: {
    color: colors.onErrorContainer,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  warningBannerDesc: {
    color: colors.onErrorContainer,
    fontFamily: typography.body,
    fontSize: 12,
  },
  sectionHeading: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
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
  },
  subjectCardCritical: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  subjectTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  subjectName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  actionReqTag: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  actionReqText: {
    color: colors.error,
    fontFamily: typography.ui,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subjectPercent: {
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  subjectMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  shortByText: {
    color: colors.error,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  borderlineText: {
    color: colors.secondary,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
