import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

/**
 * Repositorio de Users.
 * Responsable de toda la persistencia y acceso a datos de usuarios.
 * Solo contiene lógica de consultas; no incluye reglas de negocio.
 */
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /**
   * Busca usuarios activos: no eliminados (soft delete) y is_active = true.
   *
   * @returns Lista de usuarios activos
   */
  async findActiveUsers(): Promise<User[]> {
    return this.repo.find({
      where: { deletedAt: IsNull(), isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Busca todos los usuarios no eliminados.
   *
   * @returns Lista de usuarios no eliminados
   */
  async findAll(): Promise<User[]> {
    return this.repo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Busca un usuario por ID (excluyendo eliminados).
   *
   * @param id - UUID del usuario
   * @returns Usuario o null
   */
  async findOneById(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  /**
   * Busca un usuario por email (excluyendo eliminados).
   *
   * @param email - Email del usuario
   * @returns Usuario o null
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Persiste un usuario (crear o actualizar).
   *
   * @param user - Entidad User a guardar
   * @returns Usuario guardado
   */
  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  /**
   * Eliminación lógica (soft delete) por ID.
   *
   * @param id - UUID del usuario
   * @returns Resultado con affected
   */
  async softDelete(id: string): Promise<{ affected?: number }> {
    return this.repo.softDelete(id);
  }
}
