import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Local } from './local.entity';
import { ReservaStatus } from '../../common/enums';

@Entity('reservas_locais')
export class ReservaLocal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ type: 'timestamp' })
  dataHoraFim: Date;

  @Column({ type: 'enum', enum: ReservaStatus, default: ReservaStatus.PENDENTE })
  status: ReservaStatus;

  @ManyToOne(() => Usuario)
  solicitante: Usuario;

  @ManyToOne(() => Local)
  local: Local;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}