import { Match } from './Match.js';
interface Player {
    id: string | number;
    score: number;
    pairedUpDown?: boolean;
    receivedBye?: boolean;
    avoid?: Array<string | number>;
    colors?: Array<'w' | 'b'>;
    rating?: number | null;
}
export declare function Swiss(players: Player[], round: number, rated?: boolean, colors?: boolean): Match[];
export {};
