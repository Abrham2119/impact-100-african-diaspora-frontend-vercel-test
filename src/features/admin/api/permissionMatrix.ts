import type { MatrixRow } from '@/domain/entities/admin.types';
import { MATRIX_ACTIONS } from '@/domain/entities/admin.types';
import type { Permission } from '@/domain/enums/permission.enum';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { ROLE_PERMISSIONS } from '@/constant/roleMatrix';
import { setRolePermissionSource } from '@/domain/rules/access';
import { MATRIX, matrixPermissions } from '../fixtures/permissions';
import { adminMockStore } from './adminMockStore';

// Edits to the permission matrix (admin_permissions) applied to the mock's role grants: a cell
// switched on adds its permissions to the role, switched off removes them. Unedited cells keep the
// default matrix. Sessions pick the change up at their next sign-in or role switch.
const KNOWN = new Set<string>(Object.values(ROLE_PERMISSIONS).flat());
const isPermission = (value: string): value is Permission => KNOWN.has(value) || value.endsWith(':read') || value.endsWith(':list');

export function editedPermissions(role: ChapterRoleName, rows: MatrixRow[] = adminMockStore.read().matrix): Permission[] {
  const granted = new Set<Permission>(ROLE_PERMISSIONS[role]);
  rows.forEach((row) => {
    if (row.role !== role) return;
    const seed = MATRIX.find((m) => m.module === row.module && m.roleLabel === row.roleLabel);
    MATRIX_ACTIONS.forEach((action) => {
      if (!seed || seed.cells[action] === row.cells[action]) return;
      matrixPermissions(row.module, action)
        .filter(isPermission)
        .forEach((permission) => (row.cells[action] ? granted.add(permission) : granted.delete(permission)));
    });
  });
  return [...granted];
}

setRolePermissionSource((role) => editedPermissions(role));
