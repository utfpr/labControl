import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { HealthModule } from './health/health.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { LocaisModule } from './modules/locais/locais.module';
import { EquipamentosModule } from './modules/equipamentos/equipamentos.module';
import { DisciplinasModule } from './modules/disciplinas/disciplinas.module';
import { AulasModule } from './modules/aulas/aulas.module';
import { ReservasLocaisModule } from './modules/reservas-locais/reservas-locais.module';
import { ReservasEquipamentosModule } from './modules/reservas-equipamentos/reservas-equipamentos.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'postgres'), 
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'admin'),
        database: configService.get<string>('DB_DATABASE', 'app_db'),
        
        // Esta linha faz o TypeORM buscar todas as entidades automaticamente
        entities: [__dirname + '/**/*.entity{.ts,.js}'], 
        
        autoLoadEntities: true,
        // O synchronize lerá as entidades e criará as tabelas no banco de dados
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    HealthModule,
    UsuariosModule,
    CursosModule,
    LocaisModule,
    EquipamentosModule,
    DisciplinasModule,
    AulasModule,
    ReservasLocaisModule,
    ReservasEquipamentosModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}