import { User } from '../auth/auth.model';

export interface Petition {
    id: number;
    title: string;
    description: string;
    user_id: number;
    user?: User;
    image?: string;
    status?: string;
    signers?: number;
    created_at?: string;
    updated_at?: string;
}
