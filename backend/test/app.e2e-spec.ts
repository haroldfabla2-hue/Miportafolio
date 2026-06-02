import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Sistema Completo (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Core & Health', () => {
    it('/api/health (GET) - Debe retornar estado del servicio', () => {
      return request(app.getHttpServer())
        .get('/health') // El health check está en el base controller o app controller
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeDefined();
        });
    });
  });

  describe('Autenticación y Seguridad', () => {
    it('/auth/login (POST) - Debe rechazar credenciales inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'fake@example.com', password: 'wrongpassword' })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Unauthorized');
        });
    });

    it('/api/... - Zero Trust - Rutas protegidas sin token deben fallar (401)', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });
  });
});
