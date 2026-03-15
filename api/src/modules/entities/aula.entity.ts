import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Disciplina } from './disciplina.entity';
import { Local } from './local.entity';
import { Usuario } from './usuario.entity';

@Entity('aulas')
export class Aula {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  dataInicio: string;

  @Column({ type: 'date' })
  dataFim: string;

  @Column({ type: 'int' })
  diaSemana: number; // 1 a 7

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFim: string;

  @ManyToOne(() => Disciplina)
  disciplina: Disciplina;

  @ManyToOne(() => Local)
  local: Local;

  @ManyToOne(() => Usuario)
  professor: Usuario;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}