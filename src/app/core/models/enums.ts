// Espelham os enums do back-end (EcoRota.Domain.Enums).
// A API serializa enums como string (JsonStringEnumConverter) e também aceita string na entrada.

export type PerfilUsuario = 'Catador' | 'Gerador';

export type TipoMaterial =
  | 'Papel'
  | 'Plastico'
  | 'Metal'
  | 'Vidro'
  | 'Eletronicos'
  | 'Outros';

export type TipoLocal = 'Casa' | 'Comercio';

export const MATERIAIS: { valor: TipoMaterial; rotulo: string; icone: string }[] = [
  { valor: 'Papel', rotulo: 'Papel', icone: 'bi-newspaper' },
  { valor: 'Plastico', rotulo: 'Plástico', icone: 'bi-cup-straw' },
  { valor: 'Metal', rotulo: 'Metal', icone: 'bi-nut' },
  { valor: 'Vidro', rotulo: 'Vidro', icone: 'bi-cup' },
  { valor: 'Eletronicos', rotulo: 'Eletrônicos', icone: 'bi-cpu' },
  { valor: 'Outros', rotulo: 'Outros', icone: 'bi-three-dots' },
];

export function rotuloMaterial(valor: TipoMaterial): string {
  return MATERIAIS.find((m) => m.valor === valor)?.rotulo ?? valor;
}
