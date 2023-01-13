import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { getFromEnv } from 'src/helpers/env.helper';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import { ProductUpdateDto } from 'src/products/dtos/update-product.dto';
import {
  ProductLog,
  ProductLogDocument,
} from 'src/products/schemas/product-log.schema';
import {
  ProductPhoto,
  ProductPhotoDocument,
} from 'src/products/schemas/product-photo.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { PRODUCT_EVENTS } from '../constants/product-events.enum';
import {
  PRODUCT_PHOTO_RESPONSE_ENUMS,
  PRODUCT_RESPONSE_ENUMS,
} from '../constants/product-response.enums';
import { removeFile } from '../helpers/store-product-image.helper';

interface ManyProductsListing {
  user: {
    username: string;
    email: string;
  };
  products: ProductDocument[];
}

interface SingleProductListing {
  user: {
    username: string;
    email: string;
  };
  product: ProductDocument;
  photo: ProductPhotoDocument | any;
}

@Injectable()
export class ProductsRepository {
  private logger = new Logger('ProductsRepository', { timestamp: true });
  constructor(
    @InjectModel(Product.name)
    private readonly model: Model<ProductDocument>,
    @InjectModel(ProductPhoto.name)
    private readonly productPhotoModel: Model<ProductPhotoDocument>,
    @InjectModel(ProductLog.name)
    private readonly productLogModel: Model<ProductLogDocument>,
  ) {}

  async listUserProducts(
    user: UserDocument,
    searchAndFilter: SearchAndFilterDto,
  ): Promise<ManyProductsListing> {
    let results: ProductDocument[];
    let pageLimit = 5;
    let pageNumber = 0;

    if (searchAndFilter) {
      const { searchField, search, page, limit } = searchAndFilter;
      pageLimit = !!limit ? +limit : 5;
      pageNumber = (!!page ? +page - 1 : 0) * pageLimit;
      if (searchField && searchField.length && search && search.length) {
        results = await this.model
          .find({ [searchField]: { $regex: search, $options: 'i' } })
          .skip(pageNumber)
          .limit(pageLimit)
          .exec();
      } else {
        results = await this.model
          .find()
          .skip(pageNumber)
          .limit(pageLimit)
          .exec();
      }
    } else {
      results = await this.model
        .find()
        .skip(pageNumber)
        .limit(pageLimit)
        .exec();
    }

    return {
      user: {
        username: user.username,
        email: user.email,
      },
      products: results,
    };
  }

  async listSingleProduct(
    user: UserDocument,
    productId: string,
  ): Promise<SingleProductListing> {
    try {
      const product = await this.model
        .findOne({ userId: user._id, _id: productId })
        .exec();

      if (!product) {
        throw new UnprocessableEntityException(
          PRODUCT_RESPONSE_ENUMS.NOT_FOUND,
        );
      }

      const productPhoto = await this.productPhotoModel.findOne({
        productId: product._id,
      });

      return {
        user: {
          username: user.username,
          email: user.email,
        },
        product,
        photo: productPhoto ?? {},
      };
    } catch (error) {
      this.logger.warn(
        `User ${user.username} tried to get product with id ${productId}`,
      );

      throw new NotFoundException(error.message);
    }
  }

  async uploadProduct(
    user: UserDocument,
    uploadDetails: ProductUploadDto,
  ): Promise<SingleProductListing> {
    try {
      const product = await this.model.create({
        userId: user._id,
        ...uploadDetails,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const photo = await this.productPhotoModel.create({
        productId: product._id,
        filename: '',
        accessUrl: getFromEnv('BASE_URL') + `/products/photo/${product._id}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.createLog(
        product,
        PRODUCT_EVENTS.CREATE_PRODUCT,
        user,
        product.unitsAvailable,
      );

      return {
        user: {
          username: user.username,
          email: user.email,
        },
        product,
        photo,
      };
    } catch (error) {
      if (error.code == 11000 && error.keyPattern?.name) {
        throw new ConflictException(PRODUCT_RESPONSE_ENUMS.NAME_CONFLICT);
      }

      throw new InternalServerErrorException(error.message);
    }
  }

  async updateProduct(
    user: UserDocument,
    id: string,
    updateDetails: ProductUpdateDto,
  ): Promise<SingleProductListing> {
    try {
      const product = await this.model
        .findOne({ userId: user._id, _id: id })
        .exec();

      if (!product) {
        throw new UnprocessableEntityException(
          PRODUCT_RESPONSE_ENUMS.NOT_FOUND,
        );
      }

      const updatedProduct = await this.model.findOneAndUpdate(
        { _id: product._id },
        {
          ...updateDetails,
          updatedAt: new Date(),
        },
      );
      await this.createLog(
        product,
        PRODUCT_EVENTS.UPDATE_PRODUCT,
        user,
        product.unitsAvailable,
      );

      return {
        user: {
          username: user.username,
          email: user.email,
        },
        product: updatedProduct,
        photo: {},
      };
    } catch (error) {
      this.logger.warn(
        `User ${user.username} tried to update product photo with id ${id}`,
      );

      if (error.code == 11000 && error.keyPattern?.name) {
        throw new ConflictException(PRODUCT_RESPONSE_ENUMS.NAME_CONFLICT);
      }

      throw new UnprocessableEntityException(error.message);
    }
  }

  async updateProductPhoto(
    id: string,
    fileName: string,
    user: UserDocument,
  ): Promise<SingleProductListing> {
    try {
      const product = await this.model
        .findOne({ userId: user._id, _id: id })
        .exec();

      const photo = await this.productPhotoModel.findOne({
        productId: product._id,
      });

      if (photo.filename && photo.filename.trim().length) {
        const productImagesFolderPath = join(
          process.cwd(),
          'src/images/products',
        );
        const fullImagePath = join(
          productImagesFolderPath + '/' + photo.filename,
        );

        removeFile(fullImagePath);
      }

      const updatedPhoto = await this.productPhotoModel
        .findOneAndUpdate(
          { _id: photo._id },
          {
            filename: fileName ?? photo.filename,
            updatedAt: new Date(),
          },
        )
        .exec();

      return {
        user: {
          username: user.username,
          email: user.email,
        },
        product,
        photo: updatedPhoto,
      };
    } catch (error) {
      throw new UnprocessableEntityException(error.message);
    }
  }

  async getProductPhoto(
    user: UserDocument,
    id: string,
  ): Promise<ProductPhotoDocument> {
    try {
      const product = await this.model
        .findOne({ userId: user._id, _id: id })
        .exec();

      if (!product) {
        throw new UnprocessableEntityException(
          PRODUCT_RESPONSE_ENUMS.NOT_FOUND,
        );
      }

      const photo = await this.productPhotoModel.findOne({
        productId: product._id,
      });

      if (!photo) {
        throw new NotFoundException(PRODUCT_PHOTO_RESPONSE_ENUMS.NOT_FOUND);
      }

      if (!photo.filename || !photo.filename.trim().length) {
        throw new NotFoundException(PRODUCT_PHOTO_RESPONSE_ENUMS.NOT_UPDATED);
      }

      return photo;
    } catch (error) {
      this.logger.warn(
        `User ${user.username} tried to get product photo with id ${id}`,
      );

      throw new NotFoundException(error.message);
    }
  }

  private async createLog(
    product: ProductDocument,
    event: string,
    user: UserDocument,
    quantity: number,
  ): Promise<ProductLogDocument> {
    const productLog = await this.productLogModel.create({
      event,
      quantity,
      productId: product._id,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return productLog;
  }
}
