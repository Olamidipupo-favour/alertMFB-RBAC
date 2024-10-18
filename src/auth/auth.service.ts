import { Injectable, Inject } from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service'
@Injectable()
export class AuthService {

    constructor (
@Inject(PrismaService)
private readonly prisma: PrismaService,
    ){
    }

    //test

    testDb = async ()=>{
        return await this.prisma.user.findMany()
    }
}
