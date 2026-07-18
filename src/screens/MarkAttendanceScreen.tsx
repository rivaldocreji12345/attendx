import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import {
  getSubjectAttendanceRecord,
  upsertSubjectAttendance,
} from '@/database/services/attendanceService';
import { getSubjects } from '@/database/services/subjectService';
import type { RootState } from '@/store';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import type { AttendanceStatus, Subject } from '@/types/models';
import { getTodayISODate } from '@/utils/date';

export function MarkAttendanceScreen() {
  const { t } = useTranslation();
  const profile = useSelector((state: RootState) => state.profile.profile);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [date] = useState(getTodayISODate());
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [saving, setSaving] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [existingRecord, setExistingRecord] = useState<AttendanceStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      getSubjects().then((list) => {
        setSubjects(list);
        setSelectedSubject((prev) => (prev === null && list.length > 0 ? list[0] : prev));
      });
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!selectedSubject) return;
      getSubjectAttendanceRecord(selectedSubject.id, date).then((rec) => {
        setExistingRecord(rec?.status ?? null);
        if (rec) setStatus(rec.status);
      });
    }, [selectedSubject, date]),
  );

  async function handleSave() {
    if (!selectedSubject) {
      Alert.alert(t('selectSubjectFirst'));
      return;
    }
    setSaving(true);
    try {
      await upsertSubjectAttendance(selectedSubject.id, date, status);
      setExistingRecord(status);
      Alert.alert(t('attendanceSaved'));
    } catch {
      Alert.alert(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  }

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
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{t('markAttendance')}</Text>
        <Text style={styles.pageSubtitle}>{t('markAttendanceSubtitle')}</Text>

        {/* Logged In As */}
        <View style={styles.loggedInCard}>
          <View style={styles.loggedInAvatar}>
            <Text style={styles.loggedInAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.loggedInLabel}>{t('loggedInAs')}</Text>
            <Text style={styles.loggedInName}>{profile?.studentName ?? 'Student'}</Text>
            <Text style={styles.loggedInMeta}>
              {t('studentId')}: {profile?.rollNumber ?? '–'}
            </Text>
          </View>
        </View>

        {/* Subject Picker */}
        <Text style={styles.fieldLabel}>{t('selectSubject').toUpperCase()}</Text>
        <Pressable
          accessibilityLabel="subject-picker"
          onPress={() => setShowSubjectPicker(true)}
          style={styles.pickerBtn}
        >
          <Text style={styles.pickerBtnText}>
            {selectedSubject ? selectedSubject.name : t('selectSubject')}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.primary} />
        </Pressable>

        {/* Date */}
        <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>{t('date').toUpperCase()}</Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="today" size={20} color={colors.primary} />
          <Text style={styles.dateText}>{date}</Text>
        </View>

        {/* Status Toggle */}
        <Text style={[styles.fieldLabel, styles.fieldLabelSpacing]}>{t('status').toUpperCase()}</Text>
        <View style={styles.statusRow}>
          <Pressable
            accessibilityLabel="status-absent"
            onPress={() => setStatus('absent')}
            style={[
              styles.statusBtn,
              status === 'absent' && styles.statusBtnAbsent,
            ]}
          >
            <MaterialIcons
              name="cancel"
              size={20}
              color={status === 'absent' ? colors.onError : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.statusBtnText,
                status === 'absent' && styles.statusBtnTextAbsent,
              ]}
            >
              {t('absent')}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="status-present"
            onPress={() => setStatus('present')}
            style={[
              styles.statusBtn,
              status === 'present' && styles.statusBtnPresent,
            ]}
          >
            <MaterialIcons
              name="check-circle"
              size={20}
              color={status === 'present' ? '#fff' : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.statusBtnText,
                status === 'present' && styles.statusBtnTextPresent,
              ]}
            >
              {t('present')}
            </Text>
          </Pressable>
        </View>

        {existingRecord && (
          <Text style={styles.existingNote}>
            {t('alreadyMarkedPrefix')}: {existingRecord}. {t('updateRecordNote')}
          </Text>
        )}

        {/* Save button */}
        <Pressable
          accessibilityLabel="save-attendance-button"
          disabled={saving || !selectedSubject}
          onPress={handleSave}
          style={[styles.saveBtn, (saving || !selectedSubject) && styles.saveBtnDisabled]}
        >
          <MaterialIcons name="save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>
            {saving ? t('saving') : t('saveAttendance')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Subject Picker Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setShowSubjectPicker(false)}
        transparent
        visible={showSubjectPicker}
      >
        <Pressable
          onPress={() => setShowSubjectPicker(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('selectSubject')}</Text>
            {subjects.map((sub) => (
              <Pressable
                accessibilityLabel={`select-subject-${sub.name}`}
                key={sub.id}
                onPress={() => {
                  setSelectedSubject(sub);
                  setShowSubjectPicker(false);
                }}
                style={[
                  styles.modalOption,
                  selectedSubject?.id === sub.id && styles.modalOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedSubject?.id === sub.id && styles.modalOptionTextActive,
                  ]}
                >
                  {sub.name}
                </Text>
                {selectedSubject?.id === sub.id && (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
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
  pageTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  loggedInCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  loggedInAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedInAvatarText: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  loggedInLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loggedInName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  loggedInMeta: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
  },
  fieldLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  fieldLabelSpacing: {
    marginTop: spacing.md,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  pickerBtnText: {
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 14,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  dateText: {
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  statusBtnAbsent: {
    backgroundColor: colors.errorContainer,
    borderColor: colors.error,
  },
  statusBtnPresent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusBtnText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  statusBtnTextAbsent: {
    color: colors.error,
  },
  statusBtnTextPresent: {
    color: colors.onPrimary,
  },
  existingNote: {
    color: colors.secondary,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  modalTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  modalOptionActive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  modalOptionText: {
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 15,
  },
  modalOptionTextActive: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontWeight: '600',
  },
});
