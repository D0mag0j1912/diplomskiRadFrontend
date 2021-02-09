export interface Recept{
    mkbSifraPrimarna: string;
    mkbSifraSekundarna: string[];
    osnovnaListaLijekDropdown?: string;
    osnovnaListaLijekText?: string;
    dopunskaListaLijekDropdown?: string;
    dopunskaListaLijekText?: string;
    osnovnaListaMagPripravakDropdown?: string;
    osnovnaListaMagPripravakText?: string;
    dopunskaListaMagPripravakDropdown?: string;
    dopunskaListaMagPripravakText?: string;
    kolicina: string;
    doziranje: string;
    dostatnost: string;
    hitnost: string;
    ponovljivost: string;
    brojPonavljanja: string;
}