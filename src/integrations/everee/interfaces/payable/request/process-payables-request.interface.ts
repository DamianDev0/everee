export interface ProcessPayablesRequest {
  externalIds?: string[];
  workerIds?: string[];
  externalWorkerIds?: string[];
  externalTypes?: string[];
  includeWorkersOnRegularPayCycle?: boolean;
}
