export class Participacija{
    constructor(
        public idParticipacija: number,
        public razlogParticipacija: string,
        public trajnoParticipacija?: string,
        public participacijaDo?: string
    ){}
}