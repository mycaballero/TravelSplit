import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';

/**
 * Módulo de Users.
 *
 * Este módulo gestiona las operaciones CRUD de usuarios (excepto creación, que se maneja en AuthModule).
 *
 * Estructura (Patrón Service + Repository):
 * - Controller: Maneja las peticiones HTTP de gestión de usuarios (GET, PUT, DELETE)
 * - Service: Lógica de negocio; orquesta el repositorio
 * - Repository: Acceso a datos y consultas
 * - Entity: Define el modelo de datos de User
 * - DTO: Define los contratos de validación y respuesta de la API
 *
 * Endpoints:
 * - GET /users - Listar usuarios activos (no eliminados y is_active = true)
 * - GET /users/:id - Obtener un usuario por ID
 * - PUT /users/:id - Actualizar un usuario
 * - DELETE /users/:id - Eliminar un usuario (soft delete)
 *
 * NOTA: El registro de usuarios (POST) se maneja en AuthModule (POST /auth/register).
 * Este módulo también es utilizado por AuthModule para:
 * - Crear usuarios durante el registro (a través de UsersService)
 * - Buscar usuarios durante el login (a través de UsersService)
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
