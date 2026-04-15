import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Local } from './local.entity';
import { Status } from '../../common/enums'; // 👈 Trocado para 'Status'

@Entity('reservas_locais')
export class ReservaLocal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ type: 'timestamp' })
  dataHoraFim: Date;

  @Column({ type: 'enum', enum: Status, default: Status.PENDENTE })
  status: Status;

  @ManyToOne(() => Usuario)
  solicitante: Usuario;

  @ManyToOne(() => Local)
  local: Local;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}