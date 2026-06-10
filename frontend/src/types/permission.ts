export interface ProjectAccess {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDeprioritize: boolean;
  canInvite: boolean;
  grantedBy: string;
  grantedByName?: string;
  grantedAt: string;
}

export interface ProjectAccessResponse {
  id: string;
  projectId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDeprioritize: boolean;
  canInvite: boolean;
  grantedBy: string;
  grantedByName?: string;
  grantedAt: string;
}

export interface GrantAccessRequest {
  userId: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDeprioritize: boolean;
  canInvite: boolean;
}

export interface UpdateAccessRequest {
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canDeprioritize?: boolean;
  canInvite?: boolean;
}

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDeprioritize: boolean;
  canInvite: boolean;
  canGrantAccess: boolean;
}
