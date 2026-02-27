import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  profilePicture?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  mobileNumber?: string;

  @IsOptional()
  @IsEmail()
  emailAddress?: string;

  @IsOptional()
  @IsDateString()
  dateOfBrith?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  maritalStatus?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  address?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  city?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  state?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  userName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  employeeType?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  department?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  designation?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  workingDays?: string;

  @IsOptional()
  @IsDateString()
  joiningAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  officeLocation?: string;

  @IsOptional()
  @IsString()
  employeeCv?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkdeinLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  githubLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  slackUserName?: string;
}
