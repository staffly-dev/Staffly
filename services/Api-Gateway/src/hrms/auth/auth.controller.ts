/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Res,
  BadRequestException,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response, Request } from 'express';
import { AuthGatewayService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { WelcomeEmailDto } from './dto/welcome-email.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CheckCouponDto } from './dto/check-coupon.dto';
import { UploadProfilePictureDto } from './dto/upload-profile-picture.dto';
import { OAuthGoogleLoginDto } from './dto/oauth-google-login.dto';
import { OAuthWelcomeDto } from './dto/oauth-welcome.dto';
import configuration from '../../common/config/configuration';
import { firstValueFrom } from 'rxjs';
import type { UploadedFile as CustomUploadedFile } from '../../common/interfaces/file.interface';

@ApiTags('HRMS Auth')
@Controller('api/v1/hrms/auth')
export class AuthGatewayController {
  constructor(private readonly authService: AuthGatewayService) { }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and password. Sends a verification email. Frontend should then call verify-email with the code. Requires: email, password, and optional profile fields.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created; verification email sent.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already registered.',
  })
  register(
    @Body() dto: RegisterDto,
    @Headers('user-agent') userAgent = 'unknown',
  ) {
    return this.authService.register(dto, userAgent);
  }

  @Post('verify-email')
  @ApiOperation({
    summary: 'Verify email with code',
    description:
      'Confirms the user email using the code sent after registration. Call this after the user enters the code from their email. On success, the account is activated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code.',
  })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('welcome-email-user')
  @ApiOperation({
    summary: 'Complete welcome (set role) and get tokens',
    description:
      'After email verification, the user sets their role (e.g. HR, Employee) and receives access and refresh tokens. Tokens are set in HTTP-only cookies. Returns userId and userRole for the frontend.',
  })
  @ApiResponse({
    status: 200,
    description: 'Welcome completed; cookies set with tokens.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payload or user already completed welcome.',
  })
  async welcomeEmail(
    @Body() dto: Omit<WelcomeEmailDto, 'userAgent'>,
    @Headers('user-agent') userAgent = 'unknown',
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(
      this.authService.welcomeEmail(dto, userAgent),
    );

    // Set refresh token in HTTP-only cookie
    response.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set access token in HTTP-only cookie
    response.cookie('accessToken', result.data.accessToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });

    // Return response without tokens in body
    return {
      message: result.message,
      data: {
        userId: result.data.userId,
        userRole: result.data.userRole,
      },
    };
  }

  @Post('upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload profile picture',
    description:
      'Uploads a profile image for the user. Send as multipart/form-data with field "file" and optional userId. Returns the stored file URL or key.',
  })
  @ApiResponse({ status: 200, description: 'Profile picture uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'No file provided or invalid file type.' })
  uploadProfilePicture(
    @Body() dto: UploadProfilePictureDto,
    @UploadedFile() file: CustomUploadedFile,
  ) {
    if (!file) {
      throw new BadRequestException('Profile picture file is required');
    }
    return this.authService.uploadProfilePicture({ ...dto, file });
  }

  @Post('check-coupon-code')
  @ApiOperation({
    summary: 'Validate coupon code',
    description:
      'Checks if a coupon/promo code is valid. Use before checkout or subscription. Returns validity and any discount or plan details tied to the code.',
  })
  @ApiResponse({ status: 200, description: 'Coupon valid; returns code details.' })
  @ApiResponse({ status: 400, description: 'Coupon invalid or expired.' })
  checkCouponCode(@Body() dto: CheckCouponDto) {
    return this.authService.checkCouponCode(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates the user with email and password. On success, sets accessToken and refreshToken in HTTP-only cookies and returns user object (without tokens). Frontend should send credentials: true for cookies.',
  })
  @ApiResponse({ status: 200, description: 'Login successful; cookies set; returns user.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(
    @Body() dto: LoginDto,
    @Headers('user-agent') userAgent = 'unknown',
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(this.authService.login(dto, userAgent));

    // Set refresh token in HTTP-only cookie
    response.cookie('refreshToken', result.data.refreshToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set access token in HTTP-only cookie
    response.cookie('accessToken', result.data.accessToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });

    // Return response without tokens in body
    return {
      message: result.message,
      data: {
        user: result.data.user,
      },
    };
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Issues a new access token using the refresh token from the refreshToken cookie. Call when the access token expires (e.g. 401). New tokens are set in cookies. Requires refreshToken cookie.',
  })
  @ApiResponse({ status: 200, description: 'Tokens refreshed; new cookies set.' })
  @ApiResponse({ status: 400, description: 'Refresh token cookie missing or invalid.' })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token cookie is required');
    }

    const result = await firstValueFrom(
      this.authService.refreshToken(refreshToken),
    );

    // Set new refresh token in HTTP-only cookie
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set new access token in HTTP-only cookie
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });

    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @Get('current-user')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns the profile of the user identified by the accessToken cookie. Use after login to load user data (id, email, role, etc.). Requires accessToken cookie or Bearer token.',
  })
  @ApiResponse({ status: 200, description: 'Returns current user object.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token.' })
  currentUser(@Req() request: Request) {
    const accessToken = request.cookies?.accessToken;
    if (!accessToken) {
      throw new BadRequestException('Access token cookie is required');
    }
    return this.authService.currentUser(accessToken);
  }

  @Post('request-reset-password')
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset email to the given email address. The user receives a code or link to verify in verify-reset-code, then can set a new password with reset-password.',
  })
  @ApiResponse({ status: 200, description: 'Reset email sent (or generic message for security).' })
  @ApiResponse({ status: 400, description: 'Invalid email or rate limit.' })
  requestResetPassword(@Body() dto: RequestResetPasswordDto) {
    return this.authService.requestResetPassword(dto);
  }

  @Post('verify-reset-code')
  @ApiOperation({
    summary: 'Verify password reset code',
    description:
      'Validates the code sent to the user email for password reset. On success, a resetToken cookie is set; the frontend must then call reset-password with the new password (cookie is sent automatically).',
  })
  @ApiResponse({ status: 200, description: 'Code valid; resetToken cookie set.' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code.' })
  async verifyResetCode(
    @Body() dto: VerifyResetCodeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(this.authService.verifyResetCode(dto));

    // Set reset token in HTTP-only cookie
    response.cookie('resetToken', result.resetToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 10, // 10 minutes
      path: '/',
    });

    return {
      message: result.message,
    };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Set new password after reset',
    description:
      'Sets the new password for the user. Requires the resetToken cookie (set by verify-reset-code). Send new password in body. After success, user can login with the new password.',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully.' })
  @ApiResponse({ status: 400, description: 'Missing resetToken cookie or invalid payload.' })
  resetPassword(@Body() dto: ResetPasswordDto, @Req() request: Request) {
    const resetToken = request.cookies?.resetToken;
    if (!resetToken) {
      throw new BadRequestException('Reset token cookie is required');
    }
    return this.authService.resetPassword({ ...dto, resetToken });
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout current session',
    description:
      'Invalidates the refresh token and clears accessToken and refreshToken cookies. Call when the user logs out. Requires refreshToken cookie.',
  })
  @ApiResponse({ status: 200, description: 'Logged out; cookies cleared.' })
  @ApiResponse({ status: 400, description: 'Refresh token cookie required.' })
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token cookie is required');
    }

    // Clear the refresh token cookie
    response.clearCookie('refreshToken', { path: '/' });
    response.clearCookie('accessToken', { path: '/' });

    return this.authService.logout(refreshToken);
  }

  @Post('oauth/google-login')
  @ApiOperation({
    summary: 'Login with Google OAuth',
    description:
      'Authenticates via Google OAuth. Send the OAuth token/credential from the frontend. If new user or PENDING role, returns isNewUser and sets providerId cookie; frontend should then call oauth/welcome-google. If existing user, sets access and refresh token cookies and returns user.',
  })
  @ApiResponse({ status: 200, description: 'Login success; cookies set or welcome required.' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth token or payload.' })
  async oAuthGoogleLogin(
    @Body() dto: OAuthGoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(this.authService.oAuthGoogleLogin(dto));

    // For new users, set providerId cookie and redirect to welcome
    if (result.isNewUser || result.user.role === 'PENDING') {
      response.cookie('providerId', result.providerId, {
        httpOnly: true,
        secure: configuration().NODE_ENV === 'production',
        sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60, // 1 hour
        path: '/',
      });

      return {
        message: 'OAuth login successful, please complete welcome step',
        data: {
          isNewUser: result.isNewUser,
          user: result.user,
          providerId: result.providerId,
        },
      };
    }

    // For existing users, set tokens and return user data
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return {
      message: 'OAuth login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    };
  }

  @Post('oauth/welcome-google')
  @ApiOperation({
    summary: 'Complete Google sign-up (set role)',
    description:
      'After Google login for a new user, set the user role and complete registration. Uses providerId from cookie or body. Sets access and refresh token cookies and returns userId, userRole, username.',
  })
  @ApiResponse({ status: 200, description: 'Welcome completed; tokens set in cookies.' })
  @ApiResponse({ status: 400, description: 'Missing providerId or invalid payload.' })
  async welcomeUserOAuthGoogle(
    @Body() dto: OAuthWelcomeDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const providerId = request.cookies?.providerId || dto.providerId;
    const userAgent = request.headers['user-agent'] || dto.userAgent;

    const result = await firstValueFrom(
      this.authService.welcomeUserOAuthGoogle({
        ...dto,
        providerId,
        userAgent,
      }),
    );

    // Set tokens as HTTP-only cookies
    response.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60, // 1 hour
      path: '/',
    });

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: configuration().NODE_ENV === 'production',
      sameSite: configuration().NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Clear providerId cookie
    response.clearCookie('providerId', { path: '/' });

    return {
      message: 'Role set and user welcomed successfully',
      data: {
        userId: result.userId,
        userRole: result.userRole,
        username: result.username,
      },
    };
  }

  @Post('logout-all')
  @ApiOperation({
    summary: 'Logout all sessions for user',
    description:
      'Invalidates all refresh tokens for the current user (all devices). Requires accessToken cookie so the gateway can identify the user. Clears auth cookies. Use for "Log out everywhere".',
  })
  @ApiResponse({ status: 200, description: 'All sessions invalidated; cookies cleared.' })
  @ApiResponse({ status: 401, description: 'Access token required.' })
  logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = request.cookies?.accessToken;
    if (!accessToken) {
      throw new BadRequestException('Access token cookie is required');
    }

    // Extract userId from access token (you might need to decode it)
    // For now, let's assume the service can extract userId from the token
    // Or you could decode it here and pass userId directly

    // Clear all auth cookies
    response.clearCookie('refreshToken', { path: '/' });
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('resetToken', { path: '/' });

    // The service should extract userId from the token
    return this.authService.logoutAll(accessToken);
  }
}
