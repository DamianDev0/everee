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
