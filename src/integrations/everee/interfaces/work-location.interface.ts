export interface EvereeCreateWorkLocationRequest {
  externalId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateAbbreviation: string;
  zipCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface EvereeWorkLocationResponse {
  locationId: string;
  externalId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateAbbreviation: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  taxJurisdictionCode?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EvereeUpdateWorkLocationRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  stateAbbreviation?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
