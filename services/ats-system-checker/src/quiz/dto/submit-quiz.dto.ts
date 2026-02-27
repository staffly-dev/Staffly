import { IsString, IsEmail, IsDefined, MinLength } from 'class-validator';

export class SubmitQuizDto {
  @IsDefined()
  answers: number[] | string | Record<string, unknown>;

  @IsString()
  @MinLength(1)
  quiz_session_id: string;

  @IsEmail()
  email: string;
}
