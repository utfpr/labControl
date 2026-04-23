import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ReservaTipo, Status } from '../../common/enums';
import { Usuario } from './usuario.entity';

@Entity('booking_history')
export class BookingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reservaId: string;

  @Column({
    type: 'enum',
    enum: ReservaTipo,
  })
  tipoReserva: ReservaTipo;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @Column({
    type: 'enum',
    enum: Status,
  })
  statusAntigo: Status;

  @Column({
    type: 'enum',
    enum: Status,
  })
  statusNovo: Status;

  @Column({ type: 'text', nullable: true })
  observacao: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuarioId' })
  usuario?: Usuario;
}
