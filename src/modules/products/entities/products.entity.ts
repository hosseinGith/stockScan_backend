import {
 Entity,
 PrimaryColumn,
 Column,
 CreateDateColumn,
 ManyToOne,
 BeforeInsert,
 UpdateDateColumn,
 OneToOne,
 JoinColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { FileEntity } from 'src/modules/files/entities/file.entity';

@Entity()
export class Products {
 @PrimaryColumn()
 id: string;
 @BeforeInsert()
 private async generateId() {
  const { nanoid } = await import('nanoid');
  this.id = nanoid();
 }

 @Column({ unique: true, type: 'varchar', length: 20 })
 barcode: string;

 @Column({ type: 'varchar', length: 255 })
 name: string;

 @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
 price: number;

 @Column({ type: 'int', default: 0 })
 quantity: number;

 @Column({ type: 'date', nullable: true })
 expiryDate: string | null;

 @Column({ type: 'text', nullable: true })
 description: string | null;

 @OneToOne(() => FileEntity)
 @JoinColumn()
 image: FileEntity;

 @Column({ type: 'int', default: 0 })
 minQuantity: number;

 @Column({ type: 'boolean', default: false })
 isActive: boolean;
 @ManyToOne(() => Users)
 creator: Users;
 @ManyToOne(() => Category, (category) => category.products)
 category: Category;

 @CreateDateColumn()
 createdAt: Date;

 @UpdateDateColumn()
 updatedAt: Date;

 get isExpired(): boolean {
  if (!this.expiryDate) return false;
  return new Date(this.expiryDate) < new Date();
 }

 get isExpiringSoon(): boolean {
  if (!this.expiryDate) return false;
  const expiry = new Date(this.expiryDate);
  const today = new Date();
  const diffDays = Math.ceil(
   (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays <= 7 && diffDays >= 0;
 }

 get totalValue(): number {
  return this.price * this.quantity;
 }

 get isLowStock(): boolean {
  return this.quantity <= this.minQuantity;
 }
}
