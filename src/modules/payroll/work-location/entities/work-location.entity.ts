import { Entity, Column, Index, OneToMany } from 'typeorm';
import { CommonEntity } from '@common/entities/base-entity';
import { Shift } from '@modules/payroll/shift/entities/shift.entity';

/**
 * Work Location entity - CRITICAL for staffing industry
 * Determines tax jurisdiction for each shift
 * Must be created before assigning shifts
 */
@Entity('work_locations')
export class WorkLocation extends CommonEntity {
  // Everee Integration
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  evereeLocationId: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  externalId: string; // Idempotency key

  // Location Information
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string; // line1 in Everee

  @Column({ type: 'varchar', length: 255, nullable: true })
  addressLine2: string; // line2 in Everee

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 2 })
  stateAbbreviation: string; // Critical for tax calculation

  @Column({ type: 'varchar', length: 10 })
  zipCode: string; // postalCode in Everee

  @Column({ type: 'varchar', length: 50, default: 'US' })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string; // From Everee create request

  // Geographic Coordinates
  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  // Timezone - CRITICAL for shift time calculations
  @Column({ type: 'varchar', length: 100, nullable: true })
  timeZone: string; // e.g., "America/New_York" from Everee

  // Effective Date
  @Column({ type: 'date', nullable: true })
  effectiveDate: Date; // From Everee - when location becomes active

  // Tax Jurisdiction Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  taxJurisdictionCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  localTaxDescription: string;

  // Client/Customer Information
  @Column({ type: 'varchar', length: 255, nullable: true })
  clientName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  clientId: string;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Sync tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSyncedWithEvereeAt: Date;

  @Column({ type: 'boolean', default: false })
  syncedWithEveree: boolean;

  // Relationships
  @OneToMany(() => Shift, (shift) => shift.workLocation)
  shifts: Shift[];
}
