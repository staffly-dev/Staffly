import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @IsArray()
  @IsNotEmpty()
  answers: number[];

  @IsString()
  @IsOptional()
  user_id?: string;
}
