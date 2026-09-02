import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  createLibraryEntrySchema,
  updateLibraryEntrySchema,
} from './dto/library.schema.dto';
import type {
  CreateLibraryEntryDto,
  UpdateLibraryEntryDto,
} from './dto/library.schema.dto';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post()
  create(
    @Req() req,
    @Body(new ZodValidationPipe(createLibraryEntrySchema))
    body: CreateLibraryEntryDto,
  ) {
    return this.libraryService.create(req.user.userId, body);
  }

  @Get()
  findAll(@Req() req) {
    return this.libraryService.findAllForUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.libraryService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateLibraryEntrySchema))
    body: UpdateLibraryEntryDto,
  ) {
    return this.libraryService.update(req.user.userId, id, body);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.libraryService.remove(req.user.userId, id);
  }
}
