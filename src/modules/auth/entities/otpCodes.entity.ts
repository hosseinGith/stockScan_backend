import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OtpCodes {
 @PrimaryColumn()
 id!: string;
 @BeforeInsert()
 private async generateId() {
  const { nanoid } = await import('nanoid');
  this.id = nanoid();
 }
 @Column()
 code!: string;
 @Column()
 number!: string;
 @Column({ default: () => 'CURRENT_TIMESTAMP', type: 'datetime' })
 created_at!: Date;

 @Column()
 number_hash!: string;
}
