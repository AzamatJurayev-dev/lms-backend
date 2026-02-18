import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  ValidateIf,
} from 'class-validator';

export enum RoomType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

export class CreateChatRoomDto {
  @IsEnum(RoomType)
  type: RoomType;

  @ValidateIf((o) => o.type === RoomType.GROUP)
  @IsInt()
  groupId?: number;

  @ValidateIf((o) => o.type === RoomType.PRIVATE)
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  memberIds?: number[];
}
