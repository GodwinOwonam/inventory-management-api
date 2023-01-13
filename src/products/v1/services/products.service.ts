import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { IResponse } from 'src/interfaces/response.interface';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import { PRODUCT_PHOTO_RESPONSE_ENUMS } from '../constants/product-response.enums';
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

  async updateProductPhoto(
    id: string,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<any | IResponse> {
    const fileName = file?.filename;

    if (!fileName) {
      throw new UnprocessableEntityException(
        PRODUCT_PHOTO_RESPONSE_ENUMS.INVALID_FILE_TYPE,
      );
    }

    await this.productsRepository.updateProductPhoto(id, fileName, user);

    return await this.getProduct(user, id);
  }

  async viewProductPhoto(
    res,
    id: string,
    user: UserDocument,
  ): Promise<IResponse> {
    const photo = await this.productsRepository.getProduct(user, id);

    return await res.sendFile(photo.filename, {
      root: './src/images/products',
    });
  }
}
