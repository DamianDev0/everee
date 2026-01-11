export interface CreateWorkLocationRequest {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  effectiveDate: string;
  externalId?: string;
}

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

export interface CreateApprovalGroupRequest {
  name: string;
}

export interface ApprovalGroupResponse {
  id: number;
  name: string;
  deleted: boolean;
}

export interface PaginatedApprovalGroupResponse {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: ApprovalGroupResponse[];
}
