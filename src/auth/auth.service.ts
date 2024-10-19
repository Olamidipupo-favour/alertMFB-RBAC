import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import { createUser, createRole, login } from './dto/auth.dto';
import {hash, compare} from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {

    constructor (
@Inject(PrismaService)
private readonly prisma: PrismaService,
@Inject(JwtService)
private readonly jwtService: JwtService,
    ){
    }

    //test

    testDb = async ()=>{
        return await this.prisma.user.findMany()
    }

    createUser = async (dto:createUser, userId:string)=>{
//create a user without considering userId for the first use.
//create a basic user role and assign it to evry user at creation after.
        await this.prisma.user.create({data: {
            email:dto.email,
            firstName:dto.firstName,
            lastName:dto.lastName,
            passwordHash: await hash(dto.password, 10),
            roles: {
                connectOrCreate : {
                    where:
                        {
                  id: 2, //user
                  name:"user"
                        },
                        create:{
                            id:2,
                         name: "user",
                         "permissions":JSON.stringify(["WRITE"]),
                        }
                }
            }
        }});

        return {
            message: "User succesfully created!"
        };
    }

    
    createRole = async (dto:createRole, userId:string) => {
        const permissions = ['READ', 'WRITE'];
        for (let i of dto.permissions){
            if(!permissions.includes(i)){
                throw new HttpException(`Invalid permission: ${i}`,HttpStatus.BAD_REQUEST);
            }
        }
         await this.prisma.role.create({
            data: {
                name: dto.name,
                permissions: JSON.stringify(dto.permissions),
            }
        });

        return {
            message: "Role succesfully created!"
        };
    }
    
    login = async (dto: login) => {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { roles: true },
        }); 
        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
        
        const isPasswordValid = await compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
        
        const payload = { userId: user.id, roles: user.roles };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
