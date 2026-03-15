import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocaisController } from './locais.controller';
import { LocaisService } from './locais.service';
import { Local } from '../entities/local.entity'; // Aponta para a sua pasta central de entidades

@Module({
  imports: [TypeOrmModule.forFeature([Local])],
  controllers: [LocaisController],
  providers: [LocaisService],
})
export class LocaisModule {}