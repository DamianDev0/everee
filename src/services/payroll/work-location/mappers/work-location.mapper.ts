import {
  CreateWorkLocationRequest,
} from '@integrations/everee/interfaces/work-location';

import {
  CreateWorkLocationDto,
} from '@modules/payroll/work-location/dtos';

export class WorkLocationMapper {
  static toCreateWorkLocationRequest(
    dto: CreateWorkLocationDto,
  ): CreateWorkLocationRequest {
    return {
      externalId: dto.externalId,
      name: dto.name,
      line1: dto.address,
      city: dto.city,
      state: dto.stateAbbreviation,
      postalCode: dto.zipCode,
      effectiveDate: new Date().toISOString().split('T')[0],
    };
  }
}
