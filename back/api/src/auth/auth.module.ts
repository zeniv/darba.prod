import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    JwtModule.register({ global: true }),
    UsersModule,
  ],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
