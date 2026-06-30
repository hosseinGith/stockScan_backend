import {
 Entity,
 PrimaryColumn,
 BeforeInsert,
 Column,
 CreateDateColumn,
} from 'typeorm';
import { Role } from '../types';

@Entity()
export class Users {
 @PrimaryColumn()
 id!: string;
 @BeforeInsert()
 private async generateId() {
  const { nanoid } = await import('nanoid');
  this.id = nanoid();
 }
 @Column({ unique: true })
 username!: string;
 @Column({ unique: true })
 username_hashed!: string;
 @Column()
 password!: string;
 @Column({ unique: true, nullable: true })
 email!: string;

 @Column({ nullable: true })
 first_name?: string;
 @Column({ nullable: true })
 last_name?: string;
 @Column({ length: 10, nullable: true, unique: true })
 national_id?: string;
 @Column({ default: Role.USER, type: 'enum', enum: Role })
 role!: Role;

 @Column({ default: true, type: 'boolean' })
 is_active!: boolean;
 @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
 created_at!: Date;
 @Column({ nullable: true, default: '' })
 national_id_hash?: string;
}
