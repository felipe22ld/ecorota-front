import { Pipe, PipeTransform } from '@angular/core';
import {
  Periodo,
  StatusSolicitacao,
  Volume,
  classeStatus,
  formatarData,
  rotuloPeriodo,
  rotuloStatus,
  rotuloVolume,
} from '../../core/models/app.models';
import { TipoMaterial, rotuloMaterial } from '../../core/models/enums';

@Pipe({ name: 'material' })
export class MaterialPipe implements PipeTransform {
  transform(v: TipoMaterial, outro?: string | null): string {
    return v === 'Outros' && outro ? outro : rotuloMaterial(v);
  }
}

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {
  transform(v: StatusSolicitacao): string {
    return rotuloStatus(v);
  }
}

@Pipe({ name: 'classeStatus' })
export class ClasseStatusPipe implements PipeTransform {
  transform(v: StatusSolicitacao): string {
    return classeStatus(v);
  }
}

@Pipe({ name: 'periodo' })
export class PeriodoPipe implements PipeTransform {
  transform(v: Periodo): string {
    return rotuloPeriodo(v);
  }
}

@Pipe({ name: 'volume' })
export class VolumePipe implements PipeTransform {
  transform(v: Volume): string {
    return rotuloVolume(v);
  }
}

@Pipe({ name: 'dataBr' })
export class DataBrPipe implements PipeTransform {
  transform(v?: string | null): string {
    return formatarData(v);
  }
}

export const PIPES_ROTULOS = [MaterialPipe, StatusPipe, ClasseStatusPipe, PeriodoPipe, VolumePipe, DataBrPipe] as const;
