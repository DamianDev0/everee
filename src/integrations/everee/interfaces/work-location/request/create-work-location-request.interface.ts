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
