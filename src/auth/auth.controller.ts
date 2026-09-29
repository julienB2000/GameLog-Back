import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { loginSchema, signupSchema } from './dto/auth.schema';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(
    @Body(new ZodValidationPipe(signupSchema))
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.signup(body.email, body.password);
  }
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(
    @Body(new ZodValidationPipe(loginSchema))
    body: {
      email: string;
      password: string;
    },
  ) {
    return this.authService.login(body.email, body.password);
  }
}
