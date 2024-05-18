import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination-product.dto';

import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(@InjectRepository(Product)
              private readonly productoRepository: Repository<Product>){}
  async create(createProductDto: CreateProductDto) {
    try {
      const p = this.productoRepository.create(createProductDto); // generamos la instancia de producto
      await this.productoRepository.save(p); // salvar la instancia de producto en la base de datos
      return p; 
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  findAll(paginationDto:PaginationDto) {
    const { limit = 10, offset = 0, } = paginationDto
    return this.productoRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(term: string) {
    let product: Product;

    if(isUUID(term)) {
      product = await this.productoRepository.findOneBy({uuid: term});
    }else{
      product = await this.findByTitleOrSlug(product, term);
    }
    
    if (!product) {
      throw new NotFoundException("Producto not found");
    }
    return product;
  }

  private async findByTitleOrSlug(product: Product, term: string) {
    const queryBuilder = this.productoRepository.createQueryBuilder();
    product = await queryBuilder.where('UPPER(title) =:title or UPPER(slug) =:slug', {
      title: term.toLocaleUpperCase(),
      slug: term.toLocaleUpperCase()
    }).getOne();
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productoRepository.preload({
      uuid: id,
      ...updateProductDto
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
    if (error.code === '23505'){
      throw new BadRequestException(error.detail);
    }
    if (error.status === 404){
      throw new NotFoundException(`Producto not found`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check your logs', error);
  }
}
