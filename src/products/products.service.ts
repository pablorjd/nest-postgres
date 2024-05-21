import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination-product.dto';

import { validate as isUUID } from "uuid";
import { ProductImage } from './entities/product_image.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(@InjectRepository(Product)
  private readonly productoRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productoImageRepository: Repository<ProductImage>,
  ) { }
  
  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...productDetails } = createProductDto; // filtramos los datos que no son imagenes y dejamos solo las imagenes y el resto de datos en productDetails

      const p = this.productoRepository.create({
        ...productDetails,
        images: images.map(image => this.productoImageRepository.create({ url: image })) // generamos la instancias de imagenes a partir de los datos de la imagen que se envia en el DTO y lo asignamos a la instancia de producto antes de guardarla
      }); // generamos la instancia de producto
      await this.productoRepository.save(p); // salvar la instancia de producto en la base de datos
      return { ...p, images: p.images.map(image => image.url) }; // devolvemos la instancia de producto con los datos de la imagen
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, } = paginationDto
    const productos = await this.productoRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,

      }
    });
    return productos.map((prod) => ({
      ...prod, images: prod.images.map(image => image.url)
    }))
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productoRepository.findOneBy({ uuid: term });
    } else {
      product = await this.findByTitleOrSlug(product, term);
    }

    if (!product) {
      throw new NotFoundException("Producto not found");
    }
    return product;
  }

  async findOnePlain(term: string) {
    const { images =[],...restProduct } = await this.findOne( term );
    return {
      ...restProduct,
      images: images.map(image => image.url)
    }


  }

  private async findByTitleOrSlug(product: Product, term: string) {
    const queryBuilder = this.productoRepository.createQueryBuilder('producto');
    product = await queryBuilder.where('UPPER(title) =:title or UPPER(slug) =:slug', {
      title: term.toLocaleUpperCase(),
      slug: term.toLocaleUpperCase()
    }).leftJoinAndSelect('producto.images', 'image')
    .getOne(); 
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productoRepository.preload({
      uuid: id,
      ...updateProductDto,
      images: []
    });
    if (!product) throw new BadRequestException('Product not found to update');
    try {
      await this.productoRepository.save(product);
      return product;
    } catch (error) {
      this.handleExeptions(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    this.productoRepository.remove(product);
  }

  private handleExeptions(error: any) {
    // console.log("🚀 ~ Produc tsService ~ create ~ error:", error)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if (error.status === 404) {
      throw new NotFoundException(`Producto not found`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check your logs', error);
  }

}
