import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Curso } from './curso.entity';
import { UserRole } from '../../common/enums';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string; // Já prevendo a junção de nome e sobrenome

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  ra: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMUM })
  role: UserRole;

  @ManyToOne(() => Curso, { nullable: false })
  curso: Curso;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}