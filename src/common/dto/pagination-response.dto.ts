import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'The current page number', example: 1 })
  currentPage: number;

  @ApiProperty({ description: 'The total number of pages', example: 15 })
  total: number;

  @ApiProperty({ description: 'The total number of pages', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'The paginated data', isArray: true })
  data: T[];
}
