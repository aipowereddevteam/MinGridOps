import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID Token is required' })
  idToken: string;
}
