export type InvitationStatus = 'pending' | 'approved' | 'declined';

export interface Invitation {
  id: string;
  eventId: string | {
    id: string;
    title: string;
    date: Date;
    venue: string;
    hostId: string | object;
  };
  userId: string | {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  message?: string;
  status: InvitationStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitationDto {
  eventId: string;
  message?: string;
}

export interface UpdateInvitationDto {
  status: InvitationStatus;
  message?: string;
}

export interface InvitationListFilters {
  eventId?: string;
  userId?: string;
  status?: InvitationStatus;
  page?: number;
  pageSize?: number;
}

export interface InvitationListResponse {
  items: Invitation[];
  total: number;
  page: number;
  pageSize: number;
}

