import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  checkHealth() {
    return {
      status: 'ok',
      message: 'Lab Control is up and running!',
      timestamp: new Date().toISOString(),
    };
  }
}