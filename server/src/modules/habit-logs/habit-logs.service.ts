import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HabitLog, HabitLogDocument } from './schemas/habit-log.schema';
import { ToggleHabitLogDto } from './dto/toggle-habit-log.dto';
import { Habit, HabitDocument } from '../habits/schemas/habit.schema';

const DEFAULT_31_ZERO_BITS = '0000000000000000000000000000000';

@Injectable()
export class HabitLogsService {
  constructor(
    @InjectModel(HabitLog.name) private readonly habitLogModel: Model<HabitLogDocument>,
    @InjectModel(Habit.name) private readonly habitModel: Model<HabitDocument>,
  ) {}

  async getLogsForMonth(userId: string, monthYear: string) {
    const userObjId = new Types.ObjectId(userId);
    return this.habitLogModel.find({ userId: userObjId, monthYear } as any);
  }

  async toggleHabitLog(userId: string, toggleDto: ToggleHabitLogDto) {
    const { habitId, day, monthYear } = toggleDto;
    const userObjId = new Types.ObjectId(userId);
    const habitObjId = new Types.ObjectId(habitId);

    // Verify habit ownership
    const habit = await this.habitModel.findOne({ _id: habitObjId, userId: userObjId } as any);
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    if (day < 1 || day > 31) {
      throw new BadRequestException('Day must be between 1 and 31');
    }

    const index = day - 1;

    // Find existing habit log or initialize new
    let logDoc = await this.habitLogModel.findOne({
      userId: userObjId,
      habitId: habitObjId,
      monthYear,
    } as any);

    let currentString = logDoc?.completionString || DEFAULT_31_ZERO_BITS;

    // Pad string if shorter than 31 characters
    if (currentString.length < 31) {
      currentString = currentString.padEnd(31, '0');
    }

    // Toggle bit: '0' -> '1', '1' -> '0'
    const currentChar = currentString[index] || '0';
    const newChar = currentChar === '1' ? '0' : '1';
    const newCompletionString =
      currentString.substring(0, index) + newChar + currentString.substring(index + 1);

    // Atomic update or insert
    const updatedLog = await this.habitLogModel.findOneAndUpdate(
      { userId: userObjId, habitId: habitObjId, monthYear } as any,
      { completionString: newCompletionString },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return updatedLog;
  }
}
