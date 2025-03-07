import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkspaceModule } from './workspace/workspace.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { BubbleModule } from './bubble/bubble.module';
import { CurveModule } from './curve/curve.module';

@Module({
  imports: [
    WorkspaceModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BubbleModule,
    CurveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
