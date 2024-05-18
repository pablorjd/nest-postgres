import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @BeforeInsert()
    checkSlug(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", " ").replaceAll("/", "");
    }
    @BeforeUpdate()
    checkSlugUpdate(){
        if(!this.slug){
            this.slug = this.title;
        }
        this.slug = this.slug.toLowerCase().replaceAll(" ", "_").replaceAll("'", " ").replaceAll("/", "");
    }
}
