import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { createGameSchema, updateGameSchema } from './dto/games.schema.dto';
import type { CreateGameDto, UpdateGameDto } from './dto/games.schema.dto';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createGameSchema)) body: CreateGameDto) {
    return this.gamesService.create(body);
  }

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateGameSchema)) body: UpdateGameDto,
  ) {
    return this.gamesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gamesService.remove(id);
  }
}
