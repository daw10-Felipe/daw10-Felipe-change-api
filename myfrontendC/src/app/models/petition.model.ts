import { User } from '../auth/auth.model';

export interface PetitionImage {
    id: number;
    path: string;
}

export interface Petition {
    id: number;
    title: string;
    description: string;
    category?: string;
    user_id: number;
    user?: User;
    image?: string;
    images?: PetitionImage[];
    status?: string;
    signers?: number;
    signers_count?: number;
    has_signed?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const PETITION_CATEGORIES = [
    'Medio Ambiente',
    'Derechos Humanos',
    'Educación',
    'Salud',
    'Política',
    'Tecnología',
    'Cultura',
    'Otros'
];

