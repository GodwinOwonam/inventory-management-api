import { Injectable } from '@nestjs/common';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { IResponse } from 'src/interfaces/response.interface';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async getUserProducts(
    user: UserDocument,
    searchAndFilter: SearchAndFilterDto,
  ): Promise<IResponse> {
    return {
      success: true,
      data: await this.productsRepository.listUserProducts(
        user,
        searchAndFilter,
      ),
    };
  }

  async getProduct(user: UserDocument, productId: string): Promise<IResponse> {
    return {
      success: true,
      data: await this.productsRepository.listSingleProduct(user, productId),
    };
  }

  async uploadProduct(
    user: UserDocument,
    uploadDetails: ProductUploadDto,
  ): Promise<IResponse> {
    return {
      success: true,
      data: await this.productsRepository.uploadProduct(user, uploadDetails),
    };
  }
}
