import {
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsOptional()
  @IsString()
  profilePicture?: string | null;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  mobileNumber: string;

  @IsEmail()
  emailAddress: string;

  @IsDateString()
  dateOfBrith: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  maritalStatus: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  gender: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nationality: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  address: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  state: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  userName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  employeeType: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  department: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  designation: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  workingDays: string;

  @IsDateString()
  joiningAt: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  officeLocation: string;

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
