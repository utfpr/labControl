import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Equipamento } from './equipamento.entity';
import { Status } from '../../common/enums'; // 👈 Trocado para 'Status'

@Entity('reservas_equipamentos')
export class ReservaEquipamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  dataHoraInicio: Date;

  @Column({ type: 'timestamp' })
  dataHoraFim: Date;

  // 👇 Atualizado para usar o enum correto
  @Column({ type: 'enum', enum: Status, default: Status.PENDENTE })
  status: Status;

  @ManyToOne(() => Usuario)
  solicitante: Usuario;

  @ManyToOne(() => Equipamento)
  equipamento: Equipamento;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}