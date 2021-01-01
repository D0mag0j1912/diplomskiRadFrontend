import { Dijagnoza } from './dijagnoza.model';

export class Posjet{
    constructor(
        public datumPosjet: string,
        public dijagnoza: Dijagnoza[],
        public razlog?: string,
        public anamneza?: string,
        public status?: string,
        public preporuka?: string
    ){}
}