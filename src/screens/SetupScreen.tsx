import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { saveProfile } from '@/database/services/profileService';
import { replaceAllSubjects } from '@/database/services/subjectService';
import { setProfile } from '@/store/slices/profileSlice';
import type { AppDispatch } from '@/store';
import { colors, radii, spacing, typography } from '@/theme/tokens';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function SetupScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [semester, setSemester] = useState(1);
  const [subjects, setSubjects] = useState(['', '', '', '', '', '']);
  const [saving, setSaving] = useState(false);

  function addSubject() {
    setSubjects((prev) => [...prev, '']);
  }

  function updateSubject(index: number, value: string) {
    setSubjects((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  function removeSubject(index: number) {
    if (subjects.length <= 6) return;
    setSubjects((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!studentName.trim() || !rollNumber.trim() || !courseName.trim()) {
      Alert.alert(t('allFieldsRequired'));
      return;
    }
    const validSubjects = subjects.map((s) => s.trim()).filter(Boolean);
    if (validSubjects.length < 6) {
      Alert.alert(t('minSubjectsRequired'));
      return;
    }

    setSaving(true);
    try {
      await saveProfile(studentName.trim(), rollNumber.trim(), courseName.trim(), semester);
      await replaceAllSubjects(validSubjects);
      const profile = {
        id: 1,
        studentName: studentName.trim(),
        rollNumber: rollNumber.trim(),
        courseName: courseName.trim(),
        semester,
        createdAt: new Date().toISOString(),
      };
      dispatch(setProfile(profile));
      router.replace('/(tabs)');
    } catch {
      Alert.alert(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>UA</Text>
            </View>
            <Text style={styles.appTitle}>{t('appTitle')}</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New Student</Text>
            </View>
          </View>
        </View>

        {/* Page title */}
        <View style={styles.titleSection}>
          <View style={styles.oneTimePill}>
            <MaterialIcons name="info" size={12} color={colors.onTertiaryFixed} />
            <Text style={styles.oneTimeText}>{t('oneTimeSetup').toUpperCase()}</Text>
          </View>
          <Text style={styles.pageTitle}>{t('profileSetup')}</Text>
          <Text style={styles.pageSubtitle}>{t('profileSetupSubtitle')}</Text>
        </View>

        {/* Section: Identity */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('identity')}</Text>
          </View>

          <Text style={styles.label}>{t('studentName')}</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="badge" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              accessibilityLabel="student-name-input"
              autoCapitalize="words"
              onChangeText={setStudentName}
              placeholder={t('studentNamePlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              style={styles.input}
              value={studentName}
            />
          </View>

          <Text style={[styles.label, styles.labelSpacing]}>{t('rollNumber')}</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="pin" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              accessibilityLabel="roll-number-input"
              autoCapitalize="characters"
              onChangeText={setRollNumber}
              placeholder={t('rollNumberPlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              style={styles.input}
              value={rollNumber}
            />
          </View>
        </View>

        {/* Section: Current Studies */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="school" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('currentStudies')}</Text>
          </View>

          <Text style={styles.label}>{t('courseName')}</Text>
          <View style={styles.inputRow}>
            <MaterialIcons name="book" size={20} color={colors.outline} style={styles.inputIcon} />
            <TextInput
              accessibilityLabel="course-name-input"
              autoCapitalize="words"
              onChangeText={setCourseName}
              placeholder={t('courseNamePlaceholder')}
              placeholderTextColor={colors.outlineVariant}
              style={styles.input}
              value={courseName}
            />
          </View>

          <Text style={[styles.label, styles.labelSpacing]}>{t('currentSemester')}</Text>
          <View style={styles.semesterGrid}>
            {SEMESTERS.map((sem) => (
              <Pressable
                accessibilityLabel={`semester-${sem}`}
                key={sem}
                onPress={() => setSemester(sem)}
                style={[styles.semesterBtn, semester === sem && styles.semesterBtnActive]}
              >
                <Text
                  style={[styles.semesterBtnText, semester === sem && styles.semesterBtnTextActive]}
                >
                  {sem}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Section: Subjects */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="format-list-bulleted" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('subjects')}</Text>
          </View>
          <Text style={styles.hintText}>{t('subjectsHint')}</Text>

          {subjects.map((subject, index) => (
            <View key={index} style={[styles.inputRow, styles.subjectRow]}>
              <TextInput
                accessibilityLabel={`subject-${index + 1}-input`}
                autoCapitalize="words"
                onChangeText={(v) => updateSubject(index, v)}
                placeholder={t('subjectPlaceholder', { n: index + 1 })}
                placeholderTextColor={colors.outlineVariant}
                style={[styles.input, styles.subjectInput]}
                value={subject}
              />
              {subjects.length > 6 && (
                <Pressable
                  accessibilityLabel={`remove-subject-${index + 1}`}
                  onPress={() => removeSubject(index)}
                  style={styles.removeBtn}
                >
                  <MaterialIcons name="close" size={18} color={colors.error} />
                </Pressable>
              )}
            </View>
          ))}

          <Pressable
            accessibilityLabel="add-more-subjects"
            onPress={addSubject}
            style={styles.addSubjectBtn}
          >
            <MaterialIcons name="add-circle" size={18} color={colors.primary} />
            <Text style={styles.addSubjectText}>{t('addMoreSubjects')}</Text>
          </Pressable>
        </View>

        {/* Verify notice */}
        <Text style={styles.verifyText}>{t('verifyDetails')}</Text>

        {/* Submit button */}
        <Pressable
          accessibilityLabel="complete-profile-setup"
          disabled={saving}
          onPress={handleSave}
          style={[styles.submitBtn, saving && styles.submitBtnDisabled]}
        >
          <MaterialIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.submitBtnText}>
            {saving ? `${t('saving')}` : t('completeProfileSetup')}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  logoRow: {
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
    fontSize: 12,
    fontWeight: '700',
  },
  appTitle: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: `${colors.primary}14`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  badgeText: {
    color: colors.primary,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  oneTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiaryFixed,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  oneTimeText: {
    color: colors.onTertiaryFixed,
    fontFamily: typography.ui,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  pageTitle: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainer,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.primary,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  label: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  labelSpacing: {
    marginTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    height: 48,
    paddingHorizontal: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 14,
    height: '100%',
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  semesterBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  semesterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  semesterBtnText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  semesterBtnTextActive: {
    color: colors.onPrimary,
  },
  hintText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  subjectRow: {
    marginBottom: spacing.sm,
  },
  subjectInput: {
    flex: 1,
  },
  removeBtn: {
    padding: spacing.xs,
    marginLeft: 4,
  },
  addSubjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  addSubjectText: {
    color: colors.primary,
    fontFamily: typography.ui,
    fontSize: 14,
    fontWeight: '600',
  },
  verifyText: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
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
});
