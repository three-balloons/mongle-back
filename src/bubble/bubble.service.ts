import { Injectable } from '@nestjs/common';
import { CreateBubbleDto } from './dto/create-bubble.dto';
import { UpdateBubbleDto } from './dto/update-bubble.dto';

@Injectable()
export class BubbleService {
  create(createBubbleDto: CreateBubbleDto) {
    return 'This action adds a new bubble';
  }

  findAll() {
    return `This action returns all bubble`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bubble`;
  }

  update(id: number, updateBubbleDto: UpdateBubbleDto) {
    return `This action updates a #${id} bubble`;
  }

  remove(id: number) {
    return `This action removes a #${id} bubble`;
  }
}
