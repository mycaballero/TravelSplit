import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../repositories/users.repository';

/**
 * Service de Users.
 * Contiene la lógica de negocio y orquesta el repositorio.
 * No accede a la base de datos directamente.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Lista usuarios activos (no eliminados y is_active = true).
   *
   * @returns Lista de usuarios activos
   */
  async findActiveUsers(): Promise<User[]> {
    return this.usersRepository.findActiveUsers();
  }

  /**
   * Crea un nuevo usuario en el sistema.
   * Valida que el email no esté duplicado y hashea la contraseña.
   *
   * @param createUserDto - DTO con los datos del usuario a crear
   * @returns Usuario creado (sin la contraseña en uso posterior via mapper)
   * @throws ConflictException si el email ya existe
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(
      createUserDto.contraseña,
      saltRounds,
    );

    const user = new User();
    user.nombre = createUserDto.nombre;
    user.email = createUserDto.email;
    user.passwordHash = passwordHash;
    user.isActive = true;

    return this.usersRepository.save(user);
  }

  /**
   * Obtiene todos los usuarios no eliminados (incluye inactivos).
   *
   * @returns Lista de usuarios no eliminados
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  /**
   * Obtiene un usuario por su ID.
   *
   * @param id - ID del usuario a buscar
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  /**
   * Busca un usuario por su email.
   *
   * @param email - Email del usuario a buscar
   * @returns Usuario encontrado o null si no existe
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  /**
   * Actualiza un usuario existente.
   * Valida que el email no esté duplicado (si se actualiza) y hashea la contraseña (si se actualiza).
   *
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - DTO con los datos a actualizar
   * @returns Usuario actualizado
   * @throws NotFoundException si el usuario no existe
   * @throws ConflictException si el email ya está en uso por otro usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (updateUserDto.nombre !== undefined) {
      existingUser.nombre = updateUserDto.nombre;
    }
    if (updateUserDto.email !== undefined) {
      existingUser.email = updateUserDto.email;
    }

    if (updateUserDto.contraseña !== undefined) {
      if (updateUserDto.contraseña === '') {
        throw new BadRequestException(
          'La contraseña no puede estar vacía. Debe tener al menos 8 caracteres.',
        );
      }
      if (updateUserDto.contraseña.length < 8) {
        throw new BadRequestException(
          'La contraseña debe tener al menos 8 caracteres',
        );
      }
      const saltRounds = 10;
      existingUser.passwordHash = await bcrypt.hash(
        updateUserDto.contraseña,
        saltRounds,
      );
    }

    if (updateUserDto.isActive !== undefined) {
      existingUser.isActive = updateUserDto.isActive;
    }

    return this.usersRepository.save(existingUser);
  }

  /**
   * Elimina un usuario de forma lógica (soft delete).
   *
   * @param id - ID del usuario a eliminar
   * @throws NotFoundException si el usuario no existe
   */
  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
