import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  countAllLeaves,
  countLeavesByStatus,
  getLeaves,
} from '@/database/services/leaveService';
import { getSubjects } from '@/database/services/subjectService';
import type { RootState } from '@/store';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import type { Leave, Subject } from '@/types/models';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  medical: 'Medical Leave',
  personal: 'Personal Leave',
  academic: 'Academic / Seminar',
  emergency: 'Emergency Leave',
};

const STATUS_COLORS: Record<string, string> = {
  approved: colors.success,
  pending: colors.warning,
  rejected: colors.error,
};

export function LeavesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useSelector((state: RootState) => state.profile.profile);

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [totalLeaves, setTotalLeaves] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([
        getSubjects(),
        countAllLeaves(),
        countLeavesByStatus('pending'),
      ])
        .then(([subs, total, pending]) => {
          setSubjects(subs);
          setTotalLeaves(total);
          setPendingCount(pending);
        })
        .finally(() => setLoading(false));
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      getLeaves(selectedSubjectId ?? undefined).then(setLeaves);
    }, [selectedSubjectId]),
  );

  function handleAddLeave() {
    router.push('/leaves/apply');
  }

  function getSubjectName(subjectId: number | null): string {
    if (!subjectId) return 'General';
    return subjects.find((s) => s.id === subjectId)?.name ?? 'Unknown';
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
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>{t('yourLeaves')}</Text>
            <Text style={styles.pageSubtitle}>
              {t('helloStudent')} {profile?.studentName?.split(' ')[0] ?? 'Student'},{' '}
              {t('trackAbsences')}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="add-leave-button"
            onPress={handleAddLeave}
            style={styles.addLeaveBtn}
          >
            <MaterialIcons name="add" size={18} color={colors.onPrimary} />
            <Text style={styles.addLeaveBtnText}>{t('addLeave')}</Text>
          </Pressable>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialIcons name="event-busy" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{totalLeaves}</Text>
            <Text style={styles.statLabel}>{t('leavesTaken')}</Text>
            <Text style={styles.statSub}>{t('thisSemester')}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="pending-actions" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.warning }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>{t('pendingApproval')}</Text>
            <Text style={styles.statSub}>{t('awaitingReview')}</Text>
          </View>
        </View>

        {/* Subject Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
        >
          <Pressable
            accessibilityLabel="filter-all"
            onPress={() => setSelectedSubjectId(null)}
            style={[styles.filterTab, !selectedSubjectId && styles.filterTabActive]}
          >
            <Text
              style={[
                styles.filterTabText,
                !selectedSubjectId && styles.filterTabTextActive,
              ]}
            >
              {t('allSubjects')}
            </Text>
          </Pressable>
          {subjects.map((sub) => (
            <Pressable
              accessibilityLabel={`filter-${sub.name}`}
              key={sub.id}
              onPress={() =>
                setSelectedSubjectId(selectedSubjectId === sub.id ? null : sub.id)
              }
              style={[
                styles.filterTab,
                selectedSubjectId === sub.id && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedSubjectId === sub.id && styles.filterTabTextActive,
                ]}
              >
                {sub.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Leave History Title */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{t('personalHistory')}</Text>
        </View>

        {/* Loading */}
        {loading && (
          <ActivityIndicator
            accessibilityLabel="loading-leaves"
            color={colors.primary}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {/* Empty state */}
        {!loading && leaves.length === 0 && (
          <View style={styles.emptyCard}>
            <MaterialIcons name="event-available" size={40} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>{t('noLeaveRecords')}</Text>
            <Pressable
              accessibilityLabel="apply-first-leave"
              onPress={handleAddLeave}
              style={styles.applyFirstBtn}
            >
              <Text style={styles.applyFirstBtnText}>{t('applyForLeave')}</Text>
            </Pressable>
          </View>
        )}

        {/* Leave list */}
        {leaves.map((leave) => (
          <View key={leave.id} style={styles.leaveCard}>
            <View style={styles.leaveCardLeft}>
              <Text style={styles.leaveSubjectName}>{getSubjectName(leave.subjectId)}</Text>
              <Text style={styles.leaveMeta}>
                {leave.startDate} – {leave.endDate}
              </Text>
              <Text style={styles.leaveType}>{LEAVE_TYPE_LABELS[leave.leaveType] ?? leave.leaveType}</Text>
            </View>
            <View style={styles.leaveCardRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${STATUS_COLORS[leave.status] ?? colors.outline}22` },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: STATUS_COLORS[leave.status] ?? colors.outline },
                  ]}
                >
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
            </View>
          </View>
        ))}
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
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  pageTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  pageSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 13,
  },
  addLeaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.lg,
  },
  addLeaveBtnText: {
    color: colors.onPrimary,
    fontFamily: typography.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  statValue: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.onSurface,
    fontFamily: typography.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  statSub: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 11,
  },
  tabsScroll: {
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: colors.onPrimary,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
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
  applyFirstBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    marginTop: spacing.sm,
  },
  applyFirstBtnText: {
    color: colors.onPrimary,
    fontFamily: typography.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  leaveCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  leaveCardLeft: {
    flex: 1,
  },
  leaveSubjectName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  leaveMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    marginBottom: 2,
  },
  leaveType: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 11,
  },
  leaveCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusBadgeText: {
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
  },
});
