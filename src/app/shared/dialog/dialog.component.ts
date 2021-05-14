import { Time } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    templateUrl: './dialog.component.html'
})
export class DialogComponent implements OnInit{
    constructor(
        @Inject(MAT_DIALOG_DATA) public data:
            {
                message?: string,
                brisanje?: {
                    title: string,
                    ime: string,
                    prezime: string,
                    datumDodavanja: Date,
                    vrijemeDodavanja: Time,
                    statusCekaonica: string
                }
            }
    ){}

    ngOnInit(){}
}
