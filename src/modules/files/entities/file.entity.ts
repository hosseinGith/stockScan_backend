import {
 Entity,
 PrimaryGeneratedColumn,
 Column,
 CreateDateColumn,
 UpdateDateColumn,
 DeleteDateColumn,
 ManyToOne,
 JoinColumn,
} from 'typeorm';
import { Users } from 'src/modules/users/entities/users.entity';

export enum FileStatus {
 UPLOADING = 'uploading',
 COMPLETED = 'completed',
 FAILED = 'failed',
 PROCESSING = 'processing',
}

export enum StorageProvider {
 LOCAL = 'local',
 S3 = 's3',
 CLOUDINARY = 'cloudinary',
 GOOGLE_CLOUD = 'google_cloud',
}

@Entity('files')
export class FileEntity {
 @PrimaryGeneratedColumn('uuid')
 id: string;
 @Column({ type: 'varchar', length: 255 })
 originalName: string;
 @Column({ type: 'varchar', length: 255, unique: true })
 fileName: string;
 @Column({ type: 'varchar', length: 1000 })
 path: string;
 @Column({ type: 'varchar', length: 100 })
 mimeType: string;
 @Column({ type: 'bigint' })
 size: number;
 @Column({ type: 'varchar', length: 20 })
 extension: string;
 @Column({ type: 'varchar', length: 1000, nullable: true })
 url: string;
 @Column({ type: 'varchar', length: 255, nullable: true })
 folder: string;
 @Column({ type: 'text', nullable: true })
 description: string;
 @Column({ type: 'simple-array', nullable: true })
 tags: string[];
 @Column({ type: 'int', default: 0 })
 viewCount: number;
 @Column({ type: 'varchar', length: 64, nullable: true })
 checksum: string;
 @ManyToOne(() => Users, { nullable: true, onDelete: 'SET NULL' })
 @JoinColumn()
 uploadedBy: Users;
 @CreateDateColumn({ type: 'timestamp' })
 createdAt: Date;
 @UpdateDateColumn({ type: 'timestamp' })
 updatedAt: Date;
 @DeleteDateColumn({ type: 'timestamp' })
 deletedAt: Date;
}
