import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@/database/services/profileService';
import type { AppDispatch, RootState } from '@/store';
import { setProfile } from '@/store/slices/profileSlice';
import { setLanguage, setRequireBiometric } from '@/store/slices/settingsSlice';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const profile = useSelector((state: RootState) => state.profile.profile);
  const { language, requireBiometric } = useSelector((state: RootState) => state.settings);

  useFocusEffect(
    useCallback(() => {
      // Re-fetch profile to keep fresh
      getProfile().then((p) => {
        if (p) dispatch(setProfile(p));
      });
    }, [dispatch]),
  );

  const initials = profile
    ? profile.studentName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    : 'ST';

  function handleToggleLanguage() {
    const next = language === 'en' ? 'hi' : 'en';
    dispatch(setLanguage(next));
    void i18n.changeLanguage(next);
  }

  function handleToggleBiometric(value: boolean) {
    dispatch(setRequireBiometric(value));
  }

  function handleEditProfile() {
    Alert.alert(
      t('resetProfile'),
      t('resetProfileMsg'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset'),
          style: 'destructive',
          onPress: () => {
            dispatch(setProfile(null));
            router.replace('/setup');
          },
        },
      ],
    );
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.studentName ?? 'Student'}</Text>
          <Text style={styles.profileCourse}>{profile?.courseName ?? '–'}</Text>
          <Text style={styles.profileRoll}>Roll: {profile?.rollNumber ?? '–'}</Text>
          <View style={styles.semesterPill}>
            <Text style={styles.semesterPillText}>
              {t('semester')} {profile?.semester ?? '–'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Pressable
            accessibilityLabel="edit-profile"
            onPress={handleEditProfile}
            style={styles.menuItem}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>{t('editProfile')}</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
          </Pressable>


        </View>

        {/* Settings */}
        <Text style={styles.sectionLabel}>{t('settings')}</Text>
        <View style={styles.card}>
          {/* Language */}
          <View style={styles.menuItem}>
            <MaterialIcons name="language" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>{t('language')}</Text>
            <Pressable
              accessibilityLabel="toggle-language"
              onPress={handleToggleLanguage}
              style={styles.languageToggle}
            >
              <Text
                style={[
                  styles.langOption,
                  language === 'en' && styles.langOptionActive,
                ]}
              >
                {t('english')}
              </Text>
              <Text style={styles.langDivider}>/</Text>
              <Text
                style={[
                  styles.langOption,
                  language === 'hi' && styles.langOptionActive,
                ]}
              >
                {t('hindi')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Biometric */}
          <View style={styles.menuItem}>
            <MaterialIcons name="fingerprint" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>{t('biometricLock')}</Text>
            <Switch
              accessibilityLabel="biometric-toggle"
              onValueChange={handleToggleBiometric}
              thumbColor={requireBiometric ? colors.onPrimary : colors.outline}
              trackColor={{
                false: colors.outlineVariant,
                true: colors.primary,
              }}
              value={requireBiometric}
            />
          </View>
        </View>

        {/* App info */}
        <Text style={styles.appInfoText}>{t('appTitle')} • {t('offlineTracker')}</Text>
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
  profileCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.onPrimary,
    fontFamily: typography.heading,
    fontSize: 24,
    fontWeight: '700',
  },
  profileName: {
    color: colors.onSurface,
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileCourse: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 14,
    marginBottom: 2,
  },
  profileRoll: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.body,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  semesterPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  semesterPillText: {
    color: colors.onPrimary,
    fontFamily: typography.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: colors.onSurfaceVariant,
    fontFamily: typography.ui,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  menuItemText: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: typography.body,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.md,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langOption: {
    color: colors.outline,
    fontFamily: typography.ui,
    fontSize: 13,
    fontWeight: '600',
  },
  langOptionActive: {
    color: colors.primary,
  },
  langDivider: {
    color: colors.outlineVariant,
    fontFamily: typography.ui,
    fontSize: 13,
  },
  appInfoText: {
    color: colors.outlineVariant,
    fontFamily: typography.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
