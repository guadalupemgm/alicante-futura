import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configurations')
export class Config {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: string; // ID of the business, customer, or 'system'

  @Column()
  entityType: string; // 'admin', 'business', 'customer'

  @Column()
  key: string; // The setting key (e.g. 'working_hours', 'timezone')

  @Column('simple-json', { nullable: true })
  value: unknown; // The JSON payload for that config
}
