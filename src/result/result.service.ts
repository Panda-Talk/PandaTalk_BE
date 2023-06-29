import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { tokenDto } from 'src/auth/dto/token.dto';
import { authEntity } from 'src/auth/entity/auth.entity';
import { noticeEntity } from 'src/notice/entity/notice.entity';
import { noticeAdditionalEntity } from 'src/notice/entity/noticeAdditional.entity';
import { groupEntity } from 'src/people/entity/group.entity';
import { peopleEntity } from 'src/people/entity/people.entity';
import { Repository, Between } from 'typeorm';

@Injectable()
export class ResultService {
    constructor(
        private authService: AuthService,
        @InjectRepository(authEntity) private authEntity: Repository<authEntity>,
        @InjectRepository(groupEntity) private groupEntity: Repository<groupEntity>,
        @InjectRepository(peopleEntity) private peopleEntity: Repository<peopleEntity>,
        @InjectRepository(noticeEntity) private noticeEntity: Repository<noticeEntity>,
        @InjectRepository(noticeAdditionalEntity) private additionalEntity: Repository<noticeAdditionalEntity>
    ) { 
        this.authService = authService;
    }

    /**
     * 결과 조회하기
     * 
     * @param tokenDto
     * @param cal
     * @param pgNum
     * 
     * @returns list
     */
    async getNoticeResult(tokenDto: tokenDto, cal: string, pgNum: number): Promise<object>{
        const { userID } = await this.authService.accessValidate(tokenDto);

        const thisUser = await this.authEntity.findOneByOrFail({ userID });
        
        if (!thisUser) throw new UnauthorizedException();
        
        const date = cal.split('-');

        const thisNotice = await this.noticeEntity.find({
            where: {
                createdAt: Between(
                    new Date(Number(date[0]), Number(date[1]) - 1, 2),
                    new Date(Number(date[0]), Number(date[1]), 1)
                )
            },
            order: {
                createdAt: "asc"
            },
            skip: pgNum * 10,
            take: 10,
        })

        return thisNotice;
    }

    /**
     * 결과 상세 조회
     * 
     * @param tokenDto
     * @param noticeID
     * 
     * @returns noticeList
     */
    async getMoreInfoNotice(tokenDto: tokenDto, noticeID: number): Promise<object> {
        const { userID } = await this.authService.accessValidate(tokenDto);

        const thisUser = await this.authEntity.findOneByOrFail({ userID });

        if (!thisUser) throw new UnauthorizedException();

        const thisNoticeMoreInfo = await this.noticeEntity.findOneByOrFail({ noticeID });

        if (!thisNoticeMoreInfo) throw new NotFoundException();

        return thisNoticeMoreInfo;
    }
}