export interface WorkLocationResponse {
  id: number;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

export interface PaginatedWorkLocationResponse {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: WorkLocationResponse[];
}
