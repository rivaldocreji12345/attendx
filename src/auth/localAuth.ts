import * as LocalAuthentication from 'expo-local-authentication';

export type AuthenticationResult = {
  success: boolean;
  reason?: 'hardware_unavailable' | 'not_enrolled' | 'authentication_failed';
};

export async function authenticateUser(promptMessage: string): Promise<AuthenticationResult> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();

  if (!hasHardware) {
    return { success: false, reason: 'hardware_unavailable' };
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) {
    return { success: false, reason: 'not_enrolled' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: false,
  });

  return result.success
    ? { success: true }
    : { success: false, reason: 'authentication_failed' };
}
