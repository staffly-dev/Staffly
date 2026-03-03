import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadProfilePictureDto {
  @ApiProperty({
    description: 'User ID for profile picture upload',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
