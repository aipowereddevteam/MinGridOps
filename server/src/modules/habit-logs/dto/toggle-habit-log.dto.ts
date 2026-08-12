import { IsNotEmpty, IsNumber, IsString, Max, Min, Matches } from 'class-validator';

export class ToggleHabitLogDto {
  @IsString()
  @IsNotEmpty({ message: 'Habit ID is required' })
  habitId: string;

  @IsNumber()
  @Min(1, { message: 'Day must be between 1 and 31' })
  @Max(31, { message: 'Day must be between 1 and 31' })
  day: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'monthYear must be in YYYY-MM format (e.g. 2026-08)' })
  monthYear: string;
}
