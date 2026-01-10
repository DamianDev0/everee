/**
 * Everee API Common Enums
 * Shared enums used across different Everee API endpoints
 */

export enum WorkerType {
  EMPLOYEE = 'EMPLOYEE',
  CONTRACTOR = 'CONTRACTOR',
}

export enum PayType {
  HOURLY = 'HOURLY',
  SALARY = 'SALARY',
}

export enum PaySchedule {
  SEMI_MONTHLY = 'SEMI_MONTHLY',
  BI_WEEKLY = 'BI_WEEKLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export enum MaritalStatus {
  HEAD_OF_HOUSEHOLD = 'HEAD_OF_HOUSEHOLD',
  MARRIED_FILING_JOINTLY = 'MARRIED_FILING_JOINTLY',
  SINGLE_OR_MARRIED_FILING_SEPARATELY = 'SINGLE_OR_MARRIED_FILING_SEPARATELY',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

export enum PayeeType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum EmbeddedExperience {
  ONBOARDING = 'ONBOARDING',
  WORKER_HOME = 'WORKER_HOME',
  PAYMENT_HISTORY = 'PAYMENT_HISTORY',
  TAX_DOCUMENTS = 'TAX_DOCUMENTS',
  PAYMENT_DEPOSIT = 'PAYMENT_DEPOSIT',
  HOME_ADDRESS = 'HOME_ADDRESS',
  INSTANT_PAY = 'INSTANT_PAY',
}

export enum EmbeddedExperienceVersion {
  V1_0 = 'V1_0',
  V2_0 = 'V2_0',
}

export enum LifecycleStatus {
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  TERMINATED = 'TERMINATED',
}

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
}

export enum StateAbbreviation {
  AL = 'AL',
  AK = 'AK',
  AZ = 'AZ',
  AR = 'AR',
  CA = 'CA',
  CO = 'CO',
  CT = 'CT',
  DE = 'DE',
  FL = 'FL',
  GA = 'GA',
  HI = 'HI',
  ID = 'ID',
  IL = 'IL',
  IN = 'IN',
  IA = 'IA',
  KS = 'KS',
  KY = 'KY',
  LA = 'LA',
  ME = 'ME',
  MD = 'MD',
  MA = 'MA',
  MI = 'MI',
  MN = 'MN',
  MS = 'MS',
  MO = 'MO',
  MT = 'MT',
  NE = 'NE',
  NV = 'NV',
  NH = 'NH',
  NJ = 'NJ',
  NM = 'NM',
  NY = 'NY',
  NC = 'NC',
  ND = 'ND',
  OH = 'OH',
  OK = 'OK',
  OR = 'OR',
  PA = 'PA',
  RI = 'RI',
  SC = 'SC',
  SD = 'SD',
  TN = 'TN',
  TX = 'TX',
  UT = 'UT',
  VT = 'VT',
  VA = 'VA',
  WA = 'WA',
  WV = 'WV',
  WI = 'WI',
  WY = 'WY',
  DC = 'DC',
}
