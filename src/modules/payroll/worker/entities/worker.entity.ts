import { Entity, Column, Index, OneToMany } from 'typeorm';
import { CommonEntity } from '@common/entities/base-entity';
import {
  WorkerType,
  WorkerStatus,
  OnboardingStatus,
} from '../enums/worker.enum';
import { Payable } from '@modules/payroll/payable/entities/payable.entity';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';

@Entity('workers')
export class Worker extends CommonEntity {
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  evereeWorkerId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  externalId: string; 

  // Basic Information
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  ssn: string; // Encrypted

  @Column({ type: 'varchar', length: 20, nullable: true })
  ein: string; // For contractors

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessName: string; // For contractors

  // Worker Classification
  @Column({
    type: 'enum',
    enum: WorkerType,
    default: WorkerType.CONTRACTOR,
  })
  workerType: WorkerType;

  @Column({
    type: 'enum',
    enum: WorkerStatus,
    default: WorkerStatus.PENDING_ONBOARDING,
  })
  status: WorkerStatus;

  // Onboarding
  @Column({
    type: 'enum',
    enum: OnboardingStatus,
    default: OnboardingStatus.INITIATED,
  })
  onboardingStatus: OnboardingStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  onboardingLink: string;

  @Column({ type: 'timestamp', nullable: true })
  onboardingLinkSentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  onboardingCompletedAt: Date;

  @Column({ type: 'json', nullable: true })
  onboardingData: Record<string, any>;

  // Address Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 50, default: 'US' })
  country: string;

  // Employment Information
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  defaultHourlyRate: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'date', nullable: true })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ type: 'text', nullable: true })
  terminationReason: string;

  // Workers Compensation
  @Column({ type: 'varchar', length: 20, nullable: true })
  defaultWorkersCompClassCode: string;

  // Payment Information (from Everee after onboarding)
  @Column({ type: 'json', nullable: true })
  paymentMethodDetails: Record<string, any>;

  // Tax Information (stored after onboarding completion)
  @Column({ type: 'json', nullable: true })
  taxInformation: Record<string, any>;

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  // Sync tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedWithEvereeAt: Date;

  @Column({ type: 'boolean', default: false })
  syncedWithEveree: boolean;

  // Relationships
  @OneToMany(() => Shift, (shift) => shift.worker)
  shifts: Shift[];

  @OneToMany(() => Payable, (payable) => payable.worker)
  payables: Payable[];
}
