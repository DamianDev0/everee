import {
  OnboardingContractorRequest,
  OnboardingEmployeeRequest,
  CreateCompleteContractorRequest,
  CreateCompleteEmployeeRequest,
  EmbeddedContractorRequest,
  EmbeddedEmployeeRequest,
  CreateEmbeddedSessionRequest,
  UpdateWorkerRequest,
  TerminateWorkerRequest,
  UpdatePositionRequest,
  UpdateHomeAddressRequest,
} from '@integrations/everee/interfaces/worker';

import {
  OnboardingContractorDto,
  OnboardingEmployeeDto,
  CreateCompleteContractorDto,
  CreateCompleteEmployeeDto,
  CreateEmbeddedContractorDto,
  CreateEmbeddedEmployeeDto,
  CreateEmbeddedSessionDto,
  UpdateWorkerDto,
  TerminateWorkerDto,
  UpdatePositionDto,
  UpdateHomeAddressDto,
} from '@modules/payroll/worker/dtos';

export class WorkerMapper {
  /**
   * Map OnboardingContractorDto to OnboardingContractorRequest
   */
  static toOnboardingContractorRequest(
    dto: OnboardingContractorDto,
  ): OnboardingContractorRequest {
    const request: OnboardingContractorRequest = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      hireDate: dto.hireDate,
      legalWorkAddress: {
        useHomeAddress: dto.legalWorkAddress.useHomeAddress,
        workLocationId: dto.legalWorkAddress.workLocationId,
      },
    };

    if (dto.middleName) request.middleName = dto.middleName;
    if (dto.externalWorkerId) request.externalWorkerId = dto.externalWorkerId;
    if (dto.approvalGroupId) request.approvalGroupId = dto.approvalGroupId;

    return request;
  }

  /**
   * Map OnboardingEmployeeDto to OnboardingEmployeeRequest
   */
  static toOnboardingEmployeeRequest(
    dto: OnboardingEmployeeDto,
  ): OnboardingEmployeeRequest {
    const request: OnboardingEmployeeRequest = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      payType: dto.payType as any,
      payRate: {
        currency: dto.payRate.currency,
        amount: dto.payRate.amount,
      },
      hireDate: dto.hireDate,
      legalWorkAddress: {
        useHomeAddress: dto.legalWorkAddress.useHomeAddress,
        workLocationId: dto.legalWorkAddress.workLocationId,
      },
    };

    if (dto.middleName) request.middleName = dto.middleName;
    if (dto.typicalWeeklyHours) request.typicalWeeklyHours = dto.typicalWeeklyHours;
    if (dto.paySchedule) request.paySchedule = dto.paySchedule as any;
    if (dto.eligibleForOvertime !== undefined) request.eligibleForOvertime = dto.eligibleForOvertime;
    if (dto.externalWorkerId) request.externalWorkerId = dto.externalWorkerId;
    if (dto.approvalGroupId) request.approvalGroupId = dto.approvalGroupId;
    if (dto.timeOffPolicyId) request.timeOffPolicyId = dto.timeOffPolicyId;

    return request;
  }

  /**
   * Map CreateCompleteContractorDto to CreateCompleteContractorRequest
   */
  static toCompleteContractorRequest(
    dto: CreateCompleteContractorDto,
  ): CreateCompleteContractorRequest {
    return {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      hireDate: dto.hireDate,
      homeAddress: {
        line1: dto.homeAddress.line1,
        line2: dto.homeAddress.line2,
        city: dto.homeAddress.city,
        state: dto.homeAddress.state,
        postalCode: dto.homeAddress.postalCode,
      },
      dateOfBirth: dto.dateOfBirth,
      taxpayerIdentifier: dto.taxpayerIdentifier,
      bankAccount: {
        bankName: dto.bankAccount.bankName,
        accountName: dto.bankAccount.accountName,
        accountType: dto.bankAccount.accountType as any,
        routingNumber: dto.bankAccount.routingNumber,
        accountNumber: dto.bankAccount.accountNumber,
      },
      legalWorkAddress: {
        useHomeAddress: dto.legalWorkAddress.useHomeAddress,
        workLocationId: dto.legalWorkAddress.workLocationId,
      },
      onboardingComplete: dto.onboardingComplete,
      externalWorkerId: dto.externalWorkerId,
      approvalGroupId: dto.approvalGroupId,
    };
  }

  /**
   * Map CreateCompleteEmployeeDto to CreateCompleteEmployeeRequest
   */
  static toCompleteEmployeeRequest(
    dto: CreateCompleteEmployeeDto,
  ): CreateCompleteEmployeeRequest {
    return {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      taxpayerIdentifier: dto.taxpayerIdentifier,
      dateOfBirth: dto.dateOfBirth,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      homeAddress: {
        line1: dto.homeAddress.line1,
        line2: dto.homeAddress.line2,
        city: dto.homeAddress.city,
        state: dto.homeAddress.state,
        postalCode: dto.homeAddress.postalCode,
      },
      legalWorkAddress: {
        useHomeAddress: dto.legalWorkAddress.useHomeAddress,
        workLocationId: dto.legalWorkAddress.workLocationId,
      },
      bankAccount: {
        bankName: dto.bankAccount.bankName,
        accountName: dto.bankAccount.accountName,
        accountType: dto.bankAccount.accountType as any,
        routingNumber: dto.bankAccount.routingNumber,
        accountNumber: dto.bankAccount.accountNumber,
      },
      payType: dto.payType as any,
      payRate: {
        currency: dto.payRate.currency,
        amount: dto.payRate.amount,
      },
      hireDate: dto.hireDate,
      paySchedule: dto.paySchedule as any,
      typicalWeeklyHours: dto.typicalWeeklyHours,
      withholdingSettings: {
        haveExactlyTwoJobs: dto.withholdingSettings.haveExactlyTwoJobs,
        countOfChildren: dto.withholdingSettings.countOfChildren,
        countOfOtherDependents: dto.withholdingSettings.countOfOtherDependents,
        otherIncomeAnnually: dto.withholdingSettings.otherIncomeAnnually,
        deductionsAnnually: dto.withholdingSettings.deductionsAnnually,
        extraWithholdingsMonthly: dto.withholdingSettings.extraWithholdingsMonthly,
        exempt: dto.withholdingSettings.exempt,
        maritalStatus: dto.withholdingSettings.maritalStatus as any,
      },
      eligibleForOvertime: dto.eligibleForOvertime,
      onboardingComplete: dto.onboardingComplete,
      externalWorkerId: dto.externalWorkerId,
      approvalGroupId: dto.approvalGroupId,
      timeOffPolicyId: dto.timeOffPolicyId,
    };
  }

  /**
   * Map CreateEmbeddedContractorDto to EmbeddedContractorRequest
   */
  static toEmbeddedContractorRequest(
    dto: CreateEmbeddedContractorDto,
  ): EmbeddedContractorRequest {
    return {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      startDate: dto.startDate,
      homeAddress: {
        line1: dto.homeAddress.line1,
        line2: dto.homeAddress.line2,
        city: dto.homeAddress.city,
        state: dto.homeAddress.state,
        postalCode: dto.homeAddress.postalCode,
      },
      externalWorkerId: dto.externalWorkerId,
      approvalGroupId: dto.approvalGroupId,
      payeeType: dto.payeeType as any,
    };
  }

  /**
   * Map CreateEmbeddedEmployeeDto to EmbeddedEmployeeRequest
   */
  static toEmbeddedEmployeeRequest(
    dto: CreateEmbeddedEmployeeDto,
  ): EmbeddedEmployeeRequest {
    return {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      payType: dto.payType as any,
      payRate: {
        currency: dto.payRate.currency,
        amount: dto.payRate.amount,
      },
      typicalWeeklyHours: dto.typicalWeeklyHours,
      hireDate: dto.hireDate,
      legalWorkAddress: {
        useHomeAddress: dto.legalWorkAddress.useHomeAddress,
        workLocationId: dto.legalWorkAddress.workLocationId,
      },
      homeAddress: {
        line1: dto.homeAddress.line1,
        line2: dto.homeAddress.line2,
        city: dto.homeAddress.city,
        state: dto.homeAddress.state,
        postalCode: dto.homeAddress.postalCode,
      },
      externalWorkerId: dto.externalWorkerId,
      approvalGroupId: dto.approvalGroupId,
      timeOffPolicyId: dto.timeOffPolicyId,
      paySchedule: dto.paySchedule as any,
    };
  }

  /**
   * Map CreateEmbeddedSessionDto to CreateEmbeddedSessionRequest
   */
  static toEmbeddedSessionRequest(
    dto: CreateEmbeddedSessionDto,
  ): CreateEmbeddedSessionRequest {
    return {
      workerId: dto.workerId,
      externalWorkerId: dto.externalWorkerId,
      eventHandlerName: dto.eventHandlerName,
      experience: dto.experience as any,
      experienceVersion: dto.experienceVersion as any,
      experienceOptions: dto.experienceOptions,
    };
  }

  /**
   * Map UpdateWorkerDto to UpdateWorkerRequest
   */
  static toUpdateWorkerRequest(dto: UpdateWorkerDto): UpdateWorkerRequest {
    return {
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
    };
  }

  static toTerminateWorkerRequest(dto: TerminateWorkerDto): TerminateWorkerRequest {
    return {
      terminationDate: dto.terminationDate,
      terminationReason: dto.terminationReason,
    };
  }

  static toUpdatePositionRequest(dto: UpdatePositionDto): UpdatePositionRequest {
    return {
      title: dto.title,
      payType: dto.payType,
      payRate: {
        amount: dto.payRate.toString(),
        currency: dto.currency,
      },
      expectedWeeklyHours: dto.expectedWeeklyHours,
      effectiveDate: dto.effectiveDate,
      defaultWorkersCompClassCode: dto.defaultWorkersCompClassCode,
    };
  }

  static toUpdateHomeAddressRequest(dto: UpdateHomeAddressDto): UpdateHomeAddressRequest {
    return {
      line1: dto.line1,
      line2: dto.line2,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      effectiveDate: dto.effectiveDate,
    };
  }
}
