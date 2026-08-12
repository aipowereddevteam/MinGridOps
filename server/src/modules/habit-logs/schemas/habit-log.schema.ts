import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitLogDocument = HabitLog & Document;

const DEFAULT_31_ZERO_BITS = '0000000000000000000000000000000';

@Schema({ timestamps: true })
export class HabitLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  monthYear: string;

  @Prop({ default: DEFAULT_31_ZERO_BITS })
  completionString: string;
}

export const HabitLogSchema = SchemaFactory.createForClass(HabitLog);
HabitLogSchema.index({ userId: 1, habitId: 1, monthYear: 1 }, { unique: true });
