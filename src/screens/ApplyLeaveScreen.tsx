import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createLeave } from '@/database/services/leaveService';
import { getSubjects } from '@/database/services/subjectService';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import type { LeaveType, Subject } from '@/types/models';
import { getTodayISODate } from '@/utils/date';

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: 'medical', label: 'Medical Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'academic', label: 'Academic / Seminar' },
  { value: 'emergency', label: 'Emergency Leave' },
];

export function ApplyLeaveScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [leaveType, setLeaveType] = useState<LeaveType | null>(null);
  const [startDate, setStartDate] = useState(getTodayISODate());
  const [endDate, setEndDate] = useState(getTodayISODate());
  const [reason, setReason] = useState('');
  const [documentName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  useEffect(() => {
    getSubjects().then(setSubjects);
  }, []);

  async function handleSubmit() {
    if (!leaveType) {
      Alert.alert(t('selectLeaveTypeFirst'));
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert(t('enterDates'));
      return;
    }
    if (!reason.trim()) {
      Alert.alert(t('enterReason'));
      return;
    }
    if (endDate < startDate) {
      Alert.alert(t('endBeforeStart'));
      return;
    }

    setSaving(true);
    try {
      await createLeave(
        selectedSubject?.id ?? null,
        leaveType,
        startDate,
        endDate,
        reason.trim(),
        documentName,
      );
      Alert.alert(t('leaveSubmitted'), '', [
        { text: t('cancel'), onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  }

  const leaveTypeLabel =
    LEAVE_TYPES.find((lt) => lt.value === leaveType)?.label ?? t('selectLeaveCategory');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      {/* Top App Bar with back button */}
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="go-back"
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topBarTitle}>{t('applyLeave')}</Text>
        <View style={styles.semBadge}>
          <Text style={styles.semBadgeText}>Sem</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t('applyLeaveSubtitle')}</Text>

        {/* Subject (optional) */}
        <Text style={styles.fieldLabel}>{t('selectSubjectOptional')}</Text>
        <Pressable
          accessibilityLabel="subject-picker"
          onPress={() => setShowSubjectPicker(true)}
          style={styles.pickerBtn}
        >
          <Text style={styles.pickerBtnText}>
            {selectedSubject ? selectedSubject.name : t('allSubjectsGeneral')}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.primary} />
        </Pressable>

        {/* Leave Type */}
        <Text style={[styles.fieldLabel, styles.fieldSpacing]}>{t('leaveType').toUpperCase()}</Text>
        <Pressable
          accessibilityLabel="leave-type-picker"
          onPress={() => setShowTypePicker(true)}
          style={styles.pickerBtn}
        >
          <Text style={[styles.pickerBtnText, !leaveType && styles.pickerPlaceholder]}>
            {leaveTypeLabel}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.primary} />
        </Pressable>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>{t('startDate').toUpperCase()}</Text>
            <TextInput
              accessibilityLabel="start-date-input"
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.outlineVariant}
              style={styles.dateInput}
              value={startDate}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>{t('endDate').toUpperCase()}</Text>
            <TextInput
              accessibilityLabel="end-date-input"
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.outlineVariant}
              style={styles.dateInput}
              value={endDate}
            />
          </View>
        </View>

        {/* Reason */}
        <Text style={[styles.fieldLabel, styles.fieldSpacing]}>{t('reasonForLeave').toUpperCase()}</Text>
        <TextInput
          accessibilityLabel="leave-reason-input"
          multiline
          numberOfLines={4}
          onChangeText={setReason}
          placeholder={t('reasonPlaceholder')}
          placeholderTextColor={colors.outlineVariant}
          style={styles.reasonInput}
          textAlignVertical="top"
          value={reason}
        />

        {/* Supporting Documents (placeholder) */}
        <Text style={[styles.fieldLabel, styles.fieldSpacing]}>
          {t('supportingDocuments').toUpperCase()}{' '}
          <Text style={styles.optionalText}>({t('supportingDocumentsHint')})</Text>
        </Text>
        <View style={styles.uploadBox}>
          <MaterialIcons name="cloud-upload" size={28} color={colors.outline} />
          <Text style={styles.uploadText}>{t('uploadHint')}</Text>
          <Text style={styles.uploadHint}>PDF, JPG up to 5MB</Text>
        </View>

        {/* Submit */}
        <Pressable
          accessibilityLabel="submit-leave-request"
          disabled={saving}
          onPress={handleSubmit}
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        >
          <MaterialIcons name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>
            {saving ? t('submitting') : t('submitLeaveRequest')}
          </Text>
        </Pressable>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={16} color={colors.secondary} />
          <Text style={styles.infoText}>{t('approvalTime')}</Text>
        </View>

        {/* Policy */}
        <View style={styles.policyBox}>
          <Text style={styles.policyTitle}>{t('attendancePolicy')}</Text>
          <Text style={styles.policyText}>{t('attendancePolicyDesc')}</Text>
        </View>
      </ScrollView>

      {/* Leave Type Picker Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
        transparent
        visible={showTypePicker}
      >
        <Pressable
          onPress={() => setShowTypePicker(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('selectLeaveCategory')}</Text>
            {LEAVE_TYPES.map((lt) => (
              <Pressable
                accessibilityLabel={`leave-type-${lt.value}`}
                key={lt.value}
                onPress={() => {
                  setLeaveType(lt.value);
                  setShowTypePicker(false);
                }}
                style={[
                  styles.modalOption,
                  leaveType === lt.value && styles.modalOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    leaveType === lt.value && styles.modalOptionTextActive,
                  ]}
                >
                  {lt.label}
                </Text>
                {leaveType === lt.value && (
                  <MaterialIcons name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

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
            <Text style={styles.modalTitle}>Select Subject</Text>
            <Pressable
              accessibilityLabel="select-all-subjects"
              onPress={() => {
                setSelectedSubject(null);
                setShowSubjectPicker(false);
              }}
              style={[styles.modalOption, !selectedSubject && styles.modalOptionActive]}
            >
              <Text style={[styles.modalOptionText, !selectedSubject && styles.modalOptionTextActive]}>
                {t('allSubjectsGeneral')}
              </Text>
              {!selectedSubject && <MaterialIcons name="check" size={18} color={colors.primary} />}
            </Pressable>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    gap: spacing.md,
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    flex: 1,
    color: colors.onSurface,
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
  subtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  fieldLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  fieldSpacing: {
    marginTop: spacing.md,
  },
  optionalText: {
    color: colors.outline,
    fontFamily: typography.body,
    fontSize: 11,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
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
  pickerPlaceholder: {
    color: colors.outlineVariant,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 14,
  },
  reasonInput: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 14,
    minHeight: 100,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerLow,
  },
  uploadText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
  },
  uploadHint: {
    color: colors.outline,
    fontFamily: typography.body,
    fontSize: 12,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.secondary}14`,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  infoText: {
    color: colors.secondary,
    fontFamily: typography.body,
    fontSize: 13,
    flex: 1,
  },
  policyBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  policyTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  policyText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
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
