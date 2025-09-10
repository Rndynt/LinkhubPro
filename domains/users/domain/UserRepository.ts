import { User, CreateUserData, UpdateUserData } from './User';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, userData: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(offset?: number, limit?: number): Promise<User[]>;
  count(): Promise<number>;
}
