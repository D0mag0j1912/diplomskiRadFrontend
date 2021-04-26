import { FormControl, ValidatorFn } from "@angular/forms";
//Funkcija koja provjerava je li unesen broj
export function isBroj(): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(!isNaN(parseFloat(control.value)) && isFinite(control.value)){
            return null;
        }
        return {'samoBrojevi': true};
    }
}

export function provjeriEritrocite(): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(control){
            if(+control.value < 4.34 || +control.value > 5.72){
                return {'errorEritrociti': true};
            }
            return null;
        }
    }
}
export function provjeriHemoglobin(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 138 || +control.value > 175){
              return {'errorHemoglobin': true};
          }
          return null;
      }
  }
}
export function provjeriHematokrit(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.415 || +control.value > 0.530){
              return {'errorHematokrit': true};
          }
          return null;
      }
  }
}
export function provjeriMCV(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 83 || +control.value > 97.2){
              return {'errorMCV': true};
          }
          return null;
      }
  }
}
export function provjeriMCH(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 27.4 || +control.value > 33.9){
              return {'errorMCH': true};
          }
          return null;
      }
  }
}
export function provjeriMCHC(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 320 || +control.value > 345){
              return {'errorMCHC': true};
          }
          return null;
      }
  }
}
export function provjeriRDW(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 9 || +control.value > 15){
              return {'errorRDW': true};
          }
          return null;
      }
  }
}
export function provjeriLeukociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 3.4 || +control.value > 9.7){
              return {'errorLeukociti': true};
          }
          return null;
      }
  }
}
export function provjeriTrombociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 158 || +control.value > 424){
              return {'errorTrombociti': true};
          }
          return null;
      }
  }
}
export function provjeriMPV(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 6.8 || +control.value > 10.4){
              return {'errorMPV': true};
          }
          return null;
      }
  }
}
export function provjeriTrombokrit(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.150 || +control.value > 0.320){
              return {'errorTrombokrit': true};
          }
          return null;
      }
  }
}
export function provjeriPDW(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 16 || +control.value > 25){
              return {'errorPDW': true};
          }
          return null;
      }
  }
}
export function provjeriNeutrofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 2.06 || +control.value > 6.49){
              return {'errorNeutrofilniGranulociti': true};
          }
          return null;
      }
  }
}
export function provjeriMonociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.12 || +control.value > 0.84){
              return {'errorMonociti': true};
          }
          return null;
      }
  }
}
export function provjeriLimfociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 1.19 || +control.value > 3.35){
              return {'errorLimfociti': true};
          }
          return null;
      }
  }
}
export function provjeriEozinofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0 || +control.value > 0.43){
              return {'errorEozinofilniGranulociti': true};
          }
          return null;
      }
  }
}
export function provjeriBazofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0 || +control.value > 0.06){
              return {'errorBazofilniGranulociti': true};
          }
          return null;
      }
  }
}
export function provjeriRetikulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 22 || +control.value > 97){
              return {'errorRetikulociti': true};
          }
          return null;
      }
  }
}

