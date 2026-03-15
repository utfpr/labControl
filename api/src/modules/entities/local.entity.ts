import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Curso } from './curso.entity';
import { Usuario } from './usuario.entity';

@Entity('locais')
export class Local {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @ManyToOne(() => Curso)
  curso: Curso;

  @ManyToOne(() => Usuario)
  supervisor: Usuario;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}