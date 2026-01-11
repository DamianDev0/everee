import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '@common/entities/base-entity';
import { ShiftStatus, BreakType } from '../enums/shift.enum';
import { Worker } from '@modules/payroll/worker/entities/worker.entity';
import { WorkLocation } from '@modules/payroll/work-location/entities/work-location.entity';

@Entity('shifts')
export class Shift extends CommonEntity {
  // Everee Integration
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  evereeShiftId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  externalId: string; // Idempotency key - must be deterministic

  // Worker Relationship
  @Column({ type: 'uuid' })
  @Index()
  workerId: string;

  @ManyToOne(() => Worker, (worker) => worker.shifts)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  // Work Location (CRITICAL for staffing)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  workLocationId: string;

  @ManyToOne(() => WorkLocation, (location) => location.shifts, {
    nullable: true,
  })
  @JoinColumn({ name: 'workLocationId' })
  workLocation: WorkLocation;

  // Time Information
  @Column({ type: 'timestamp' })
  @Index()
  shiftStartTime: Date;

  @Column({ type: 'timestamp' })
  shiftEndTime: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  legalWorkTimeZone: string; // Timezone from Everee (e.g., "America/New_York")

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalHours: number; // Calculated

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  // Everee durations (ISO 8601 format strings from API)
  @Column({ type: 'varchar', length: 50, nullable: true })
  shiftDurationISO: string; // e.g., "PT8H30M"

  @Column({ type: 'varchar', length: 50, nullable: true })
  paidBreakDurationISO: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unpaidBreakDurationISO: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  regularTimeWorkedISO: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  overtimeWorkedISO: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  doubleTimeWorkedISO: string;

  // Break Information
  @Column({ type: 'json', nullable: true })
  breaks: Array<{
    type: BreakType;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
  }>;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalBreakMinutes: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  unpaidBreakMinutes: number;

  // Pay Rate
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  effectiveHourlyPayRate: number; // Override default rate

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  displayHourlyPayRate: number; // Display rate for worker

  @Column({ type: 'boolean', default: false })
  payRateOverridden: boolean; // From Everee - indicates if pay rate was overridden

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calculatedGrossPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalPayableAmount: number; // From Everee payableDetails

  @Column({ type: 'boolean', default: false })
  paid: boolean; // From Everee payableDetails.paid

  // Classified time payable amounts from Everee
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  regularTimePayableAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  overtimePayableAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  doubleTimePayableAmount: number;

  // Workers Compensation
  @Column({ type: 'varchar', length: 20, nullable: true })
  workersCompClassCode: string; // e.g., '3220'

  // Tax Configuration
  @Column({ type: 'varchar', length: 50, nullable: true })
  taxCalculationConfigCode: string; // STANDARD or DIFFICULTY_OF_CARE

  // Status and Approval
  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.DRAFT,
  })
  status: ShiftStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Verification tracking (from Everee)
  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  verifiedByUserId: number | null; // Everee user ID who verified

  // Correction Tracking
  @Column({ type: 'boolean', default: false })
  isCorrection: boolean;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  originalShiftId: string; // Reference to original shift if this is a correction

  @Column({ type: 'boolean', default: false })
  correctionAuthorized: boolean;

  @Column({ type: 'text', nullable: true })
  correctionNotes: string;

  // Payment Period
  @Column({ type: 'date', nullable: true })
  @Index()
  payPeriodStartDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  payPeriodEndDate: Date;

  @Column({ type: 'boolean', default: false })
  payPeriodFinalized: boolean;

  // Metadata
  @Column({ type: 'varchar', length: 255, nullable: true })
  projectName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  projectId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Dimensions (from Everee - for cost tracking)
  @Column({ type: 'varchar', length: 100, nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenterId: string;

  // Sync tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedWithEvereeAt: Date;

  @Column({ type: 'boolean', default: false })
  syncedWithEveree: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
