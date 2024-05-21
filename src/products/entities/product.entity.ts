import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product_image.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn('uuid') 
    uuid: string

    @Column('text',{
        unique: true,
    })
    title: string;

    @Column('float',{
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    desciption: string;

    @Column({
        type: 'text',
        unique: true,
    })
    slug: string;
    
    @Column({
        type: 'int',
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    sizes:string[];

    @Column({
        type: 'text',
    })
    gender: string;

    @Column('text',{
        array: true,
        default:[]
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade:true, eager:true} // eager load all images for a product
    )
    images?:ProductImage[];

    @BeforeInsert()
    checkSlug(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", " ").replaceAll("/", "");
    }
    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
                        .replaceAll(" ", "_")
                        .replaceAll("'", " ")
                        .replaceAll("/", "");
    }
}
