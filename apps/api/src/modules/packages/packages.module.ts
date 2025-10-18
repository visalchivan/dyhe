import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { DriverPackagesController } from './driver-packages.controller';
import { PackagesService } from './packages.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PackagesController, DriverPackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}
