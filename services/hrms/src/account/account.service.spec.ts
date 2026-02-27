import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../auth/schema/user.schema';
import { RpcException } from '@nestjs/microservices';
import { UpdateAccountDto } from './dto/update-account.dto';

describe('AccountService', () => {
  let service: AccountService;
  let accountModelMock: {
    findOne: jest.Mock;
    create: jest.Mock;
    findOneAndUpdate: jest.Mock;
    findById: jest.Mock;
  };

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockAccount = {
    _id: '507f1f77bcf86cd799439012',
    name: 'John Doe',
    email: 'john@example.com',
    profilePictureUrl: null,
    bio: '',
    dateOfBirth: null,
    address: '',
  };

  beforeEach(async () => {
    accountModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(User.name),
          useValue: accountModelMock,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return existing account', async () => {
      accountModelMock.findById.mockResolvedValue(mockAccount);

      const result = await service.findOne(mockUserId, {
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: '',
      });

      expect(accountModelMock.findById).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        message: 'User account found successfully',
        data: {
          _id: mockAccount._id,
          userId: mockAccount._id,
          name: mockAccount.name,
          email: mockAccount.email,
          avatarUrl: mockAccount.profilePictureUrl,
          bio: mockAccount.bio || '',
          dateOfBirth: mockAccount.dateOfBirth || null,
          address: mockAccount.address || '',
        },
      });
    });

    it('should create account when not found but defaults provided', async () => {
      accountModelMock.findById.mockResolvedValue(null);

      const defaults = {
        name: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'http://example.com/avatar.png',
      };

      await expect(service.findOne(mockUserId, defaults)).rejects.toThrow(
        RpcException,
      );

      expect(accountModelMock.findById).toHaveBeenCalledWith(mockUserId);
    });

    it('should throw RpcException when not found and no defaults', async () => {
      accountModelMock.findById.mockResolvedValue(null);

      await expect(
        service.findOne(mockUserId, {
          name: 'John Doe',
          email: 'john@example.com',
          avatarUrl: '',
        }),
      ).rejects.toThrow(RpcException);

      expect(accountModelMock.findById).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('update', () => {
    it('should update account and return updated data', async () => {
      const updated = { ...mockAccount, name: 'New Name' };
      accountModelMock.findById.mockResolvedValue(mockAccount);
      accountModelMock.findOneAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updated),
      } as any);

      const dto = { name: 'New Name' } as UpdateAccountDto;
      const result = await service.update(mockUserId, dto);

      expect(accountModelMock.findById).toHaveBeenCalledWith(mockUserId);
      expect(accountModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockUserId },
        {
          $set: {
            name: 'New Name',
          },
        },
        { new: true, runValidators: true },
      );
      expect(result).toEqual({
        message: 'User account updated successfully',
        data: {
          _id: updated._id,
          userId: updated._id,
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.profilePictureUrl,
          bio: updated.bio || '',
          dateOfBirth: updated.dateOfBirth || null,
          address: updated.address || '',
        },
      });
    });

    it('should throw RpcException when user not found', async () => {
      accountModelMock.findById.mockResolvedValue(null);

      await expect(
        service.update(mockUserId, { name: 'New Name' } as UpdateAccountDto),
      ).rejects.toThrow(RpcException);

      expect(accountModelMock.findById).toHaveBeenCalledWith(mockUserId);
    });
  });
});
