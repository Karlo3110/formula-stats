import { Injectable } from '@nestjs/common';

import { UserNotFoundException } from '@/common/exceptions/domain.exception';

import { toUserResponse, type UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return toUserResponse(user);
  }
}
