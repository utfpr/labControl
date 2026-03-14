import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuração assíncrona do TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'), // 'postgres' via Docker, 'localhost' rodando nativo
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'admin'),
        password: configService.get<string>('DB_PASSWORD', 'admin'),
        database: configService.get<string>('DB_DATABASE', 'app_db'),
        // Carrega automaticamente qualquer entidade registrada nos módulos
        autoLoadEntities: true,
        // Sincroniza o schema do banco com as entidades (Aviso: desabilitar em produção)
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        // Estratégia de nomenclatura: converte camelCase do TS para snake_case no DB
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
