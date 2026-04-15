import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { Curso } from './curso.entity';
import { UserRole } from '../../common/enums';
import * as bcrypt from 'bcrypt';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  ra: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMUM })
  role: UserRole;

  @Column({ default: 'PENDENTE' })
  status: string; // Pode ser: 'PENDENTE', 'ATIVO' ou 'BLOQUEADO'

  @Column({ nullable: true })
  comprovanteMatricula: string;

  @ManyToOne(() => Curso, (curso) => curso.usuarios, { nullable: true })
  curso: Curso;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.senha) {
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
    }
  }
}