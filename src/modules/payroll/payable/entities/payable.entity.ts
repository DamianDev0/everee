import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '@common/entities/base-entity';
import { PayableType, PayableStatus } from '../enums/payable.enum';
import { Worker } from '../../worker/entities/worker.entity';

@Entity('payables')
export class Payable extends CommonEntity {
  // Everee Integration
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  evereePayableId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  externalId: string; // Idempotency key - CRITICAL for preventing duplicates

  @Column({ type: 'integer', nullable: true })
  evereeCompanyId: number; // From Everee response

  // Worker Relationship
  @Column({ type: 'uuid' })
  @Index()
  workerId: string;

  @ManyToOne(() => Worker, (worker) => worker.payables)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  // Payable Information
  @Column({
    type: 'enum',
    enum: PayableType,
    default: PayableType.CONTRACTOR_PAYMENT,
  })
  type: PayableType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Everee specific fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  evereePayableModel: string; // Always 'PRE_CALCULATED' from Everee

  @Column({ type: 'varchar', length: 100, nullable: true })
  evereeEarningType: string; // ADVANCE, BONUS, COMMISSION, etc.

  @Column({ type: 'bigint', nullable: true })
  earningTimestamp: number; // Unix timestamp from Everee

  @Column({ type: 'boolean', default: false })
  verified: boolean; // From Everee - indicates if payable is verified

  @Column({ type: 'varchar', length: 100, nullable: true })
  evereePaymentStatus: string | null; // PENDING_APPROVAL, APPROVED, PAID, CANCELLED

  @Column({ type: 'integer', nullable: true })
  evereePaymentId: number | null; // Payment ID from Everee

  @Column({ type: 'integer', nullable: true })
  evereePayablePaymentRequestId: number | null; // Payment request ID from Everee

  // Unit-based payables (Everee supports unit rates)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitRateAmount: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  unitRateCurrency: string; // Usually 'USD'

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCount: number; // Number of units

  // Work Location for this payable
  @Column({ type: 'integer', nullable: true })
  evereeWorkLocationId: number;

  // Status and Approval
  @Column({
    type: 'enum',
    enum: PayableStatus,
    default: PayableStatus.PENDING_APPROVAL,
  })
  status: PayableStatus;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rejectedBy: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Payment Information
  @Column({ type: 'timestamp', nullable: true })
  scheduledPaymentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReferenceId: string;

  // Project/Job Association
  @Column({ type: 'varchar', length: 100, nullable: true })
  projectId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  projectName: string;

  // Tax Information (for W-2 employees)
  @Column({ type: 'boolean', default: false })
  taxWithholdingApplied: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  federalTaxWithheld: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  stateTaxWithheld: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  localTaxWithheld: number;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Retry Logic (for failed payments)
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRetryAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  // Sync tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedWithEvereeAt: Date;

  @Column({ type: 'boolean', default: false })
  syncedWithEveree: boolean;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
