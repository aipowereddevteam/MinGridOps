import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: 'Flame' })
  icon: string;

  @Prop({ default: '#10b981' })
  color: string;

  @Prop({ default: 0 })
  position: number;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);
