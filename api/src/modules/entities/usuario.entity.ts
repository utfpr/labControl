import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, BeforeInsert } from 'typeorm';
import { Curso } from './curso.entity'; 
import { UserRole } from '../../common/enums'; 
import * as bcrypt from 'bcrypt';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string; // Nome completo do usuário

  @Column({ unique: true })
  ra: string; // Registro Acadêmico / Matrícula

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string; // O banco guardará apenas o Hash gerado pelo bcrypt

  @Column({ type: 'enum', enum: UserRole, default: UserRole.COMUM })
  role: UserRole;

  @Column({ default: false })
  ativo: boolean; // Flag de segurança: Inicia falso até ser aprovado

  @Column({ nullable: true })
  comprovanteMatricula: string; // Caminho do PDF salvo no servidor

  @ManyToOne(() => Curso, (curso) => curso.usuarios, { nullable: true })
  curso: Curso;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Gatilho Automático: Criptografa a senha antes de inserir no banco
  @BeforeInsert()
  async hashPassword() {
    if (this.senha) {
      const salt = await bcrypt.genSalt(10);
      this.senha = await bcrypt.hash(this.senha, salt);
    }
  }
}