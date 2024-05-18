import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class CreateProductDto {
  
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(50)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsOptional()
    @IsString()
    desciption?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes:string[];

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags:string[];

    @IsIn(['men','women','kid','unisex'])
    gender: string;

}
