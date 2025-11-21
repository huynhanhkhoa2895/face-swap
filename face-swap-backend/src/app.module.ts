import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FaceSwapModule } from './modules/face-swap/face-swap.module';
import { TemplateModule } from './modules/template/template.module';
import { UserTrackingModule } from './modules/user-tracking/user-tracking.module';
import { configuration } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'outputs'),
      serveRoot: '/outputs',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'templates'),
      serveRoot: '/templates',
    }),
    FaceSwapModule,
    TemplateModule,
    UserTrackingModule,
  ],
})
export class AppModule {}
