import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DB_VARIABLES } from './constants';
import { Dialect } from 'sequelize/types';
import { WordsModule } from './wordsToLearn/wordsToLearn.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>(DB_VARIABLES.DATABASE_URL)
          ? {
              host: config.get<string>(DB_VARIABLES.DATABASE_URL),
              autoLoadModels: true,
              synchronize: true,
            }
          : {
              dialect: config.get<Dialect>(DB_VARIABLES.DATABASE_DIALECT),
              host: config.get<string>(DB_VARIABLES.DATABASE_HOST),
              port: config.get<number>(DB_VARIABLES.DATABASE_PORT),
              username: config.get<string>(DB_VARIABLES.DATABASE_USER),
              password: config.get<string>(DB_VARIABLES.DATABASE_PASSWORD),
              database: config.get<string>(DB_VARIABLES.DATABASE_NAME),
              autoLoadModels: true,
              synchronize: true,
              logging: false,
            },
    }),
    AuthModule,
    WordsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
