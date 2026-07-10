import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useAuthLogout } from '@/hooks/useAuthLogout';
import {
  useSetupTwoFactor,
  useVerifyTwoFactor,
  useDisableTwoFactor,
} from '@/features/auth/hooks/useTwoFactor';
import { extractApiError } from '@/infrastructure/api/api';

// Email-OTP based two-factor: Enable → backend emails a code → confirm it.
function TwoFactorCard() {
  const [code, setCode] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const setup = useSetupTwoFactor();
  const verify = useVerifyTwoFactor();
  const disable = useDisableTwoFactor();
  const error = setup.error ?? verify.error ?? disable.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add an extra layer of security with an email verification code at sign-in.
        </p>

        {awaitingCode ? (
          <>
            <FormField label="Verification code" htmlFor="tfa-code">
              <Input
                id="tfa-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </FormField>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  verify.mutate(code, {
                    onSuccess: () => {
                      setAwaitingCode(false);
                      setCode('');
                    },
                  })
                }
                disabled={verify.isPending || code.length !== 6}
              >
                {verify.isPending && <Spinner />} Confirm &amp; enable
              </Button>
              <Button variant="ghost" onClick={() => setAwaitingCode(false)}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setup.mutate(undefined, { onSuccess: () => setAwaitingCode(true) })}
              disabled={setup.isPending}
            >
              {setup.isPending && <Spinner />} Enable 2FA
            </Button>
            <Button
              variant="ghost"
              onClick={() => disable.mutate()}
              disabled={disable.isPending}
            >
              Disable
            </Button>
          </div>
        )}

        {verify.isSuccess && (
          <p className="text-sm text-primary">Two-factor authentication is enabled.</p>
        )}
        {disable.isSuccess && (
          <p className="text-sm text-muted-foreground">Two-factor authentication disabled.</p>
        )}
        {error && <p className="text-sm text-destructive">{extractApiError(error)}</p>}
      </CardContent>
    </Card>
  );
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthLogout();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Manage your preferences and session." />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Currently using {theme} mode.</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{user?.role}</span>
            </div>
          </CardContent>
        </Card>

        <TwoFactorCard />

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout}>
              Log out of this device
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
