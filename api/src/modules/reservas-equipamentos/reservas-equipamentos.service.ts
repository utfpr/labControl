import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservaEquipamento } from '../entities/reserva.equipamento.entity';
import { Usuario } from '../entities/usuario.entity';
import { Equipamento } from '../entities/equipamento.entity';
import { Status, ReservaTipo } from '../../common/enums';
import { CriarReservaEquipamentoDto } from './dto/criar-reserva-equipamento.dto';
import { BookingConflictService, DateTimeRange } from '../shared/booking-conflict.service';
import { BookingHistoryService } from '../shared/booking-history.service';

@Injectable()
export class ReservasEquipamentosService {
  constructor(
    @InjectRepository(ReservaEquipamento)
    private reservasEquipamentosRepository: Repository<ReservaEquipamento>,
    private bookingConflictService: BookingConflictService,
    private bookingHistoryService: BookingHistoryService,
  ) { }

  async criar(dados: CriarReservaEquipamentoDto): Promise<ReservaEquipamento> {
    const inicio = new Date(dados.dataHoraInicio);
    const fim = new Date(dados.dataHoraFim);

    // Validate datetime range
    const validationError = this.bookingConflictService.validateDateTimeRange(inicio, fim);
    if (validationError) {
      throw new BadRequestException(validationError);
    }

    // Prevent booking in the past
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() / 60);
    if (inicio < agora) {
      throw new BadRequestException('Não é possível reservar datas no passado.');
    }

    const datetimeRange: DateTimeRange = { inicio, fim };

    // Check for existing equipment booking conflicts
    const bookingConflictError = await this.bookingConflictService.checkEquipmentBookingConflict(
      dados.equipamentoId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (bookingConflictError) {
      throw new BadRequestException(bookingConflictError);
    }

    // Check for location occupancy conflicts
    const locationConflictError = await this.bookingConflictService.checkEquipmentLocationConflict(
      dados.equipamentoId,
      datetimeRange.inicio,
      datetimeRange.fim,
    );
    if (locationConflictError) {
      throw new BadRequestException(locationConflictError);
    }

    // All validations passed - create the reservation
    try {
      const novaReserva = await this.reservasEquipamentosRepository.save({
        dataHoraInicio: inicio,
        dataHoraFim: fim,
        motivo: dados.motivo,
        status: Status.PENDENTE,
        solicitante: { id: dados.solicitanteId } as Usuario,
        equipamento: { id: dados.equipamentoId } as Equipamento,
      });

      return novaReserva;
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao criar reserva de equipamento. Por favor, tente novamente.',
      );
    }
  }

  async listarTodas(): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      relations: ['solicitante', 'equipamento'],
      order: { createdAt: 'DESC' }
    });
  }

  async listarMinhasReservas(usuarioId: string): Promise<ReservaEquipamento[]> {
    return await this.reservasEquipamentosRepository.find({
      where: { solicitante: { id: usuarioId } },
      relations: ['equipamento', 'equipamento.local'],
      order: { createdAt: 'DESC' }
    });
  }

  async alterarStatus(id: string, novoStatus: Status): Promise<ReservaEquipamento> {
    const reserva = await this.reservasEquipamentosRepository.findOneBy({ id });

    if (!reserva) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    reserva.status = novoStatus;
    return await this.reservasEquipamentosRepository.save(reserva);
  }
}