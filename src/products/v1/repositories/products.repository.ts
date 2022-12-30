import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { ProductUploadDto } from 'src/products/dtos/create-product.dto';
import { SearchAndFilterDto } from 'src/products/dtos/search-and-filter.dto';
import {
  ProductPhoto,
  ProductPhotoDocument,
} from 'src/products/schemas/product-photo.schema';
import { Product, ProductDocument } from 'src/products/schemas/product.schema';
import { PRODUCT_RESPONSE_ENUMS } from '../constants/product-response.enums';

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
    const product = await this.model.create({
      userId: user._id,
      ...uploadDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const photo = await this.productPhotoModel.create({
      productId: product._id,
      filename: '',
      accessUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      user: {
        username: user.username,
        email: user.email,
      },
      product,
      photo,
    };
  }
}
