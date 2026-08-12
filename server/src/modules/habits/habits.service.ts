import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { HabitLog, HabitLogDocument } from '../habit-logs/schemas/habit-log.schema';
import { CreateHabitDto } from './dto/create-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private readonly habitModel: Model<HabitDocument>,
    @InjectModel(HabitLog.name) private readonly habitLogModel: Model<HabitLogDocument>,
  ) {}

  async createHabit(userId: string, createHabitDto: CreateHabitDto) {
    const userObjId = new Types.ObjectId(userId);
    const habitCount = await this.habitModel.countDocuments({ userId: userObjId as any });

    const habit = await this.habitModel.create({
      userId: userObjId,
      title: createHabitDto.title,
      icon: createHabitDto.icon || 'Flame',
      color: createHabitDto.color || '#10b981',
      position: createHabitDto.position ?? habitCount,
    });

    return habit;
  }

  async getHabitsForUser(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    return this.habitModel.find({ userId: userObjId as any }).sort({ position: 1, createdAt: 1 });
  }

  async deleteHabit(userId: string, habitId: string) {
    const userObjId = new Types.ObjectId(userId);
    const habitObjId = new Types.ObjectId(habitId);

    const habit = await this.habitModel.findOneAndDelete({
      _id: habitObjId,
      userId: userObjId,
    } as any);

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Delete all habit logs associated with this habit
    await this.habitLogModel.deleteMany({
      habitId: habitObjId,
      userId: userObjId,
    } as any);

    return { message: 'Habit deleted successfully', habitId };
  }
}
