import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitLogsController } from './habit-logs.controller';
import { HabitLogsService } from './habit-logs.service';
import { HabitLog, HabitLogSchema } from './schemas/habit-log.schema';
import { Habit, HabitSchema } from '../habits/schemas/habit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HabitLog.name, schema: HabitLogSchema },
      { name: Habit.name, schema: HabitSchema },
    ]),
  ],
  controllers: [HabitLogsController],
  providers: [HabitLogsService],
  exports: [HabitLogsService],
})
export class HabitLogsModule {}
