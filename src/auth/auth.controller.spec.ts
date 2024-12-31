import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { User } from '../users/user.entity';
import { Wallet } from '../wallet/wallet.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUserRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockWalletRepo = {
    save: jest.fn(),
  };
  const mockJwtService = {
    sign: () => 'jwt-token',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepo)
      .overrideProvider(getRepositoryToken(Wallet))
      .useValue(mockWalletRepo)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should sign up user successfully', async () => {
      mockUserRepo.save.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({ accessToken: 'jwt-token' });
        });
    });

    it('should return 409 if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(409)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Conflict',
            message: 'Email already in use',
            statusCode: 409,
          });
        });
    });

    it('should return 400 if name, email and password is missing', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send()
        .expect(400)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Bad Request',
            message: [
              'email should not be empty',
              'email must be an email',
              'password must be longer than or equal to 8 characters',
              'name should not be empty',
              'name must be a string',
            ],
            statusCode: 400,
          });
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hashSync('password123', 10),
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ accessToken: 'jwt-token' });
        });
    });

    it('should return 401 if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(undefined);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Unauthorized',
            message: 'Invalid credentials',
            statusCode: 401,
          });
        });
    });

    it('should return 401 if invalid password', async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hashSync('password123', 10),
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Unauthorized',
            message: 'Invalid credentials',
            statusCode: 401,
          });
        });
    });

    it('should return 401 if email and password is missing', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send()
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({
            error: 'Unauthorized',
            message: 'Missing credentials',
            statusCode: 401,
          });
        });
    });
  });
});
