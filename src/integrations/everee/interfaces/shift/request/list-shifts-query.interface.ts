export interface ListShiftsQuery {
  'worker-id'?: string[];
  'external-worker-id'?: string[];
  'payment-id'?: number[];
  'min-work-location-start-date'?: string;
  'max-work-location-start-date'?: string;
  'min-work-location-end-date'?: string;
  'max-work-location-end-date'?: string;
  page?: number;
  size?: number;
}
