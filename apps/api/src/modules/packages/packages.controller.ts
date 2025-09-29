import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { BulkCreatePackagesDto } from './dto/bulk-create-packages.dto';
import { BulkAssignPackagesDto } from './dto/bulk-assign-packages.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('packages')
@UseGuards(JwtAuthGuard)
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.create(createPackageDto);
  }

  @Post('bulk')
  bulkCreate(@Body() bulkCreateDto: BulkCreatePackagesDto) {
    console.log(
      'Received bulk create request:',
      JSON.stringify(bulkCreateDto, null, 2),
    );
    console.log('Packages array length:', bulkCreateDto.packages?.length);
    console.log('First package:', bulkCreateDto.packages?.[0]);
    return this.packagesService.bulkCreate(bulkCreateDto);
  }

  @Post('bulk-assign')
  bulkAssign(@Body() bulkAssignDto: BulkAssignPackagesDto) {
    console.log(
      'Received bulk assign request:',
      JSON.stringify(bulkAssignDto, null, 2),
    );
    return this.packagesService.bulkAssign(bulkAssignDto);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.packagesService.findAll(page || 1, limit || 10, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packagesService.update(id, updatePackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }
}
