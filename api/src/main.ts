import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitando CORS
  app.enableCors();

  // Configuração global de validação (class-validator e class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviar campos não mapeados
      transform: true, // Transforma os payloads nos tipos corretos (ex: string para número)
    }),
  );

  // Configuração automática da documentação Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentação da API do sistema (Legacy Evolution)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/docs`);
}
bootstrap();
