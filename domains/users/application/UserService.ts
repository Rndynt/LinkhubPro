import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../domain/UserRepository';
import { User, CreateUserData, UpdateUserData } from '../domain/User';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: CreateUserData): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'tenant',
      plan: userData.plan || 'free',
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    return this.userRepository.update(id, userData);
  }

  async getAllUsers(offset = 0, limit = 50): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      this.userRepository.findAll(offset, limit),
      this.userRepository.count(),
    ]);
    return { users, total };
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): { userId: string; email: string; role: string; plan: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
