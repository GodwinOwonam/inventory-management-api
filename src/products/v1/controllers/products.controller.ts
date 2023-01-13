import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { GetUser } from 'src/auth/v1/decorators/get-user.decorator';
import { IResponse } from 'src/interfaces/response.interface';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import { saveProductImageToStorage } from '../helpers/store-product-image.helper';
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

  @Post('/photo/:id')
  @UseInterceptors(FileInterceptor('photo', saveProductImageToStorage))
  async uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserDocument,
  ): Promise<any> {
    return await this.productsService.updateProductPhoto(id, file, user);
  }

  @Get('/photo/:id')
  async viewProductPhoto(
    @Res() res,
    @GetUser() user: UserDocument,
    @Param('id') id: string,
  ): Promise<IResponse> {
    return await this.productsService.viewProductPhoto(res, id, user);
  }
}
