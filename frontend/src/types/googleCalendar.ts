// Tipos para Google Calendar
export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: Array<{
    email: string;
    responseStatus: string;
  }>;
  creator?: {
    email: string;
  };
  organizer?: {
    email: string;
  };
  htmlLink?: string;
}

export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
}

export type UpdateCalendarEventRequest = CreateCalendarEventRequest;

export interface CalendarEventsResponse {
  events: GoogleCalendarEvent[];
  total: number;
}

export interface CalendarStatusResponse {
  connected: boolean;
  hasRefreshToken: boolean;
}

export interface AuthUrlResponse {
  authUrl: string;
}

export interface CallbackResponse {
  message: string;
  connected: boolean;
}

export interface DisconnectResponse {
  message: string;
  connected: boolean;
}

// Tipos para el componente de calendario
export interface CalendarViewProps {
  events: GoogleCalendarEvent[];
  loading?: boolean;
  onEventCreate?: (event: CreateCalendarEventRequest) => void;
  onEventUpdate?: (eventId: string, event: UpdateCalendarEventRequest) => void;
  onEventDelete?: (eventId: string) => void;
}

export interface CalendarEventFormData {
  title: string;
  description: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  location: string;
  attendees: string[];
}
