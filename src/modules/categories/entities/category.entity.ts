import { Products } from 'src/modules/products/entities/products.entity';
import {
 Entity,
 PrimaryColumn,
 Column,
 CreateDateColumn,
 BeforeInsert,
 OneToMany,
 UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
 @PrimaryColumn()
 id: string;
 @BeforeInsert()
 private async generateId() {
  const { nanoid } = await import('nanoid');
  this.id = nanoid();
 }
 @Column({ type: 'varchar', length: 100, unique: true })
 name: string;

 @OneToMany(() => Products, (product) => product.category)
 products: Products[];

 @CreateDateColumn()
 createdAt: Date;

 @UpdateDateColumn()
 updatedAt: Date;
}
