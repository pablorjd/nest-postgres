import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from '../common/dto/pagination-product.dto';

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
    return;
  }

  // TODO: Implement pagination
  findAll(paginationDto:PaginationDto) {
    const { limit = 10, offset = 0, } = paginationDto
    return this.productoRepository.find({
      take: limit,
      skip: offset
    });
  }

  async findOne(id: string) {
      const producto = await this.productoRepository.findOneBy({uuid:id});
      if (!producto) {
        throw new NotFoundException("Producto not found");
      }
      return producto;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
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
