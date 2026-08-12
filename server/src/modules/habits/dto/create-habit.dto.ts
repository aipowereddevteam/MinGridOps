import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty({ message: 'Habit title is required' })
  title: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}
