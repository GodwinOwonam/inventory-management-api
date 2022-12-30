import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { GetUser } from 'src/auth/v1/decorators/get-user.decorator';
import { IResponse } from 'src/interfaces/response.interface';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import { ProductsService } from '../services/products.service';

@UseGuards(AuthGuard())
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  async getUserProducts(
    @GetUser() user: UserDocument,
    searchAndFilter: SearchAndFilterDto,
  ): Promise<IResponse> {
    return await this.productsService.getUserProducts(user, searchAndFilter);
  }

  @Post('')
  async uploadProduct(
    @GetUser() user: UserDocument,
    @Body() uploadDetails: ProductUploadDto,
  ): Promise<IResponse> {
    return await this.productsService.uploadProduct(user, uploadDetails);
  }

  @Get('/:id')
  async getProduct(
    @GetUser() user: UserDocument,
    @Param('id') id: string,
  ): Promise<IResponse> {
    return await this.productsService.getProduct(user, id);
  }
}
