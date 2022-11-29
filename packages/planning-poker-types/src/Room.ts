import { z } from 'zod';
import { ZodRoomRaw } from './Room.zod';

export type Room = z.infer<typeof ZodRoomRaw>;
