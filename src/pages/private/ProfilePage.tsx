import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { AppLoadingState } from '@/components/feedback/AppStates';
import { useMe, useUpdateMe } from '@/features/users/hooks/useUsers';
import { extractApiError } from '@/infrastructure/api/api';

interface ProfileForm {
  full_name: string;
  bio: string;
}

export function ProfilePage() {
  const profile = useMe();
  const update = useUpdateMe();
  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: { full_name: '', bio: '' },
  });

  // Populate the form once the profile loads.
  useEffect(() => {
    if (profile.data) {
      reset({ full_name: profile.data.full_name ?? '', bio: profile.data.bio ?? '' });
    }
  }, [profile.data, reset]);

  if (profile.isLoading) return <AppLoadingState label="Loading profile…" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Update your personal information." />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit((v) => update.mutate(v))} className="space-y-4">
            <FormField label="Full name" htmlFor="full_name">
              <Input id="full_name" {...register('full_name')} />
            </FormField>
            <FormField label="Bio" htmlFor="bio">
              <Input id="bio" placeholder="A short bio" {...register('bio')} />
            </FormField>

            {update.isError && (
              <p className="text-sm text-destructive">{extractApiError(update.error)}</p>
            )}
            {update.isSuccess && <p className="text-sm text-primary">Profile updated.</p>}

            <Button type="submit" disabled={update.isPending}>
              {update.isPending && <Spinner />} Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
