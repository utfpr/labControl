import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Equipamento } from './equipamento.entity';
import { ReservaStatus } from '../../common/enums';

@Entity('reservas_equipamentos')
export class ReservaEquipamento {
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

  @ManyToOne(() => Equipamento)
  equipamento: Equipamento;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}