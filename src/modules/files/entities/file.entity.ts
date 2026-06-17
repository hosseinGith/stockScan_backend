import {
 Entity,
 PrimaryGeneratedColumn,
 Column,
 CreateDateColumn,
 UpdateDateColumn,
 DeleteDateColumn,
 ManyToOne,
 JoinColumn,
 Index,
 BeforeInsert,
 BeforeUpdate,
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
@Index(['fileName'])
@Index(['folder'])
@Index(['uploadedBy'])
@Index(['isActive', 'isPublic'])
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

 @Column({ type: 'varchar', length: 1000, nullable: true })
 thumbnailUrl: string;

 @Column({ type: 'int', nullable: true })
 width: number;

 @Column({ type: 'int', nullable: true })
 height: number;

 @Column({ type: 'float', nullable: true })
 duration: number;

 @Column({ type: 'boolean', default: false })
 isPublic: boolean;

 @Column({ type: 'boolean', default: true })
 isActive: boolean;

 @Column({ type: 'varchar', length: 255, nullable: true })
 folder: string;

 @Column({ type: 'text', nullable: true })
 description: string;

 @Column({ type: 'simple-array', nullable: true })
 tags: string[];

 @Column({ type: 'jsonb', nullable: true })
 metadata: Record<string, any>;

 @Column({ type: 'int', default: 0 })
 downloadCount: number;

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

 @BeforeInsert()
 @BeforeUpdate()
 generateUrl() {
  if (!this.url && this.path) {
   this.url = `/files/${this.fileName}`;
  }
 }

 getFileSizeFormatted(): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = this.size;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
   size /= 1024;
   unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
 }

 isImage(): boolean {
  return this.mimeType.startsWith('image/');
 }

 isVideo(): boolean {
  return this.mimeType.startsWith('video/');
 }

 isDocument(): boolean {
  return (
   this.mimeType.includes('pdf') ||
   this.mimeType.includes('document') ||
   this.mimeType.includes('spreadsheet')
  );
 }
}
