import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

//Metoda za errore
export function handleError(error: HttpErrorResponse){
    console.log("tu sam");
    if(error.error instanceof ErrorEvent){
        console.error("An error occured: "+error.error.message);
    }
    else{
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
        'Something bad happened; please try again later.');
}