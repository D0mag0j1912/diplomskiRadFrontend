import { FormControl, ValidatorFn } from "@angular/forms";

export function isBroj(): ValidatorFn{
    return (control: FormControl): {[key: string]: boolean} | null => {
        if(!isNaN(parseFloat(control.value))){
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
        }
    }
}
export function provjeriHemoglobin(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 138 || +control.value > 175){
              return {'errorHemoglobin': true};
          }
      }
  }
}
export function provjeriHematokrit(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.415 || +control.value > 0.530){
              return {'errorHematokrit': true};
          }
      }
  }
}
export function provjeriMCV(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 83 || +control.value > 97.2){
              return {'errorMCV': true};
          }
      }
  }
}
export function provjeriMCH(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 27.4 || +control.value > 33.9){
              return {'errorMCH': true};
          }
      }
  }
}
export function provjeriMCHC(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 320 || +control.value > 345){
              return {'errorMCHC': true};
          }
      }
  }
}
export function provjeriRDW(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 9 || +control.value > 15){
              return {'errorRDW': true};
          }
      }
  }
}
export function provjeriLeukociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 3.4 || +control.value > 9.7){
              return {'errorLeukociti': true};
          }
      }
  }
}
export function provjeriTrombociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 158 || +control.value > 424){
              return {'errorTrombociti': true};
          }
      }
  }
}
export function provjeriMPV(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 6.8 || +control.value > 10.4){
              return {'errorMPV': true};
          }
      }
  }
}
export function provjeriTrombokrit(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.150 || +control.value > 0.320){
              return {'errorTrombokrit': true};
          }
      }
  }
}
export function provjeriPDW(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 16 || +control.value > 25){
              return {'errorPDW': true};
          }
      }
  }
}
export function provjeriNeutrofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 2.06 || +control.value > 6.49){
              return {'errorNeutrofilniGranulociti': true};
          }
      }
  }
}
export function provjeriMonociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0.12 || +control.value > 0.84){
              return {'errorMonociti': true};
          }
      }
  }
}
export function provjeriLimfociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 1.19 || +control.value > 3.35){
              return {'errorLimfociti': true};
          }
      }
  }
}
export function provjeriEozinofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0 || +control.value > 0.43){
              return {'errorEozinofilniGranulociti': true};
          }
      }
  }
}
export function provjeriBazofilniGranulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 0 || +control.value > 0.06){
              return {'errorBazofilniGranulociti': true};
          }
      }
  }
}
export function provjeriRetikulociti(): ValidatorFn{
  return (control: FormControl): {[key: string]: boolean} | null => {
      if(control){
          if(+control.value < 22 || +control.value > 97){
              return {'errorRetikulociti': true};
          }
      }
  }
}

