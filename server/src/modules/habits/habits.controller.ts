import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  async createHabit(
    @CurrentUser('_id') userId: any,
    @Body() createHabitDto: CreateHabitDto,
  ) {
    return this.habitsService.createHabit(userId.toString(), createHabitDto);
  }

  @Get()
  async getHabits(@CurrentUser('_id') userId: any) {
    return this.habitsService.getHabitsForUser(userId.toString());
  }

  @Delete(':id')
  async deleteHabit(
    @CurrentUser('_id') userId: any,
    @Param('id') habitId: string,
  ) {
    return this.habitsService.deleteHabit(userId.toString(), habitId);
  }
}
