import { IsString, MinLength } from 'class-validator';

export class QuizSessionDto {
  @IsString()
  @MinLength(1)
  session_id: string;
}
