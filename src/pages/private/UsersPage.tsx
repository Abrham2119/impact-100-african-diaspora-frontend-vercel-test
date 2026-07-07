import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AppLoadingState, AppErrorState, AppEmptyState } from '@/components/feedback/AppStates';
import { useUsersList } from '@/features/users/hooks/useUsers';
import { extractApiError } from '@/infrastructure/api/api';

// Admin user management — gated by <PermissionRoute require="users:list"> in
// the route table. The API also enforces the permission on every request.
export function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const users = useUsersList(page, limit);

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users (requires users:list)." />

      {users.isLoading ? (
        <AppLoadingState label="Loading users…" />
      ) : users.isError ? (
        <AppErrorState message={extractApiError(users.error)} />
      ) : !users.data?.data.length ? (
        <AppEmptyState title="No users found" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.data.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{u.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {users.data?.page ?? page} of {users.data?.total_pages ?? 1} · {users.data?.total ?? 0} users
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!!users.data && page >= users.data.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
