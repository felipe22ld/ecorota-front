import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CabecalhoPublico } from '../../layout/cabecalho-publico';
import { Rodape } from '../../layout/rodape';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CabecalhoPublico, Rodape],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  readonly passos = [
    {
      titulo: 'Conte o que você precisa',
      texto: 'Informe se quer descartar ou recolher e indique o tipo de material.',
    },
    {
      titulo: 'Encontre quem está perto',
      texto: 'Veja catadores, geradores e pontos de coleta disponíveis na sua região.',
    },
    {
      titulo: 'Combine a retirada',
      texto: 'Converse, escolha o melhor horário e confirme a coleta com segurança.',
    },
  ];

  readonly beneficios = [
    {
      icone: 'bi-geo-alt',
      titulo: 'Conexões no seu bairro',
      texto: 'Menos distância entre o material reciclável e quem pode dar um novo destino a ele.',
      fundo: 'bg-eco-secao',
    },
    {
      icone: 'bi-clock',
      titulo: 'Mais agilidade',
      texto: 'Organize retiradas sem perder tempo procurando contatos ou pontos de coleta.',
      fundo: 'bg-eco-claro',
    },
    {
      icone: 'bi-tree',
      titulo: 'Impacto que aparece',
      texto: 'Evite descartes incorretos e acompanhe sua contribuição para uma cidade mais limpa.',
      fundo: 'bg-eco-laranja',
    },
    {
      icone: 'bi-shield-check',
      titulo: 'Rede de confiança',
      texto: 'Perfis claros e acordos diretos para tornar cada coleta mais simples e segura.',
      fundo: 'bg-eco-azul',
    },
  ];
}
