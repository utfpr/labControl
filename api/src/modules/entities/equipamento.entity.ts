import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Curso } from './curso.entity';
import { Local } from './local.entity';
import { EquipamentoStatus } from '../../common/enums';

@Entity('equipamentos')
export class Equipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  patrimonio: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'text', nullable: true })
  especificacao: string;

  @Column({ type: 'varchar', nullable: true })
  arquivoPop: string; // Caminho ou URL para o PDF

  @Column({ type: 'enum', enum: EquipamentoStatus, default: EquipamentoStatus.NORMAL })
  status: EquipamentoStatus;

  @ManyToOne(() => Curso)
  curso: Curso;

  @ManyToOne(() => Local)
  local: Local;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}