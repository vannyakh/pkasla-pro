export interface AgendaItem {
  id: string;
  eventId: string;
  date: string; // ISO date string, e.g. "2025-12-31"
  time: string; // "07:00"
  description?: string;
  createdBy?: string | { id: string; name: string; email: string; avatar?: string };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateAgendaItemDto {
  eventId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string;
}

export interface UpdateAgendaItemDto {
  date?: string;
  time?: string;
  description?: string;
}

