import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business } from './entities/business.entity';
import { UsersModule } from '../users/users.module'; // 👈 NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([Business]),
    UsersModule, // 👈 NUEVO
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}