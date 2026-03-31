import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super_senha_secreta_do_labcontrol', // Deve ser exatamente a mesma do auth.module!
    });
  }

  // Se o token for válido e a senha bater, o NestJS roda essa função
  async validate(payload: any) {
    // O que retornarmos aqui ficará disponível em todas as rotas protegidas através de req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}