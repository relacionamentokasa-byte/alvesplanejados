import React from 'react';
import { Proposta, Contrato } from '../types/alves';

type StatusType = Proposta['status'] | Contrato['status'];

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md';
}

interface StatusConfig {
  label: string;
  dotColor: string;
  dotPulse?: boolean;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

const statusMap: Record<string, StatusConfig> = {
  // Propostas
  rascunho: {
    label: 'Em Elaboração',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  enviada: {
    label: 'Enviada ao Cliente',
    dotColor: 'bg-sky-500',
    dotPulse: true,
    textColor: 'text-sky-800',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20'
  },
  aprovada: {
    label: 'Proposta Aprovada',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/25'
  },
  solicitou_ajuste: {
    label: 'Ajustes Solicitados',
    dotColor: 'bg-purple-500',
    dotPulse: true,
    textColor: 'text-purple-800',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  contrato_gerado: {
    label: 'Contrato Gerado',
    dotColor: 'bg-[#C5A265]',
    textColor: 'text-[#8A6B32]',
    bgColor: 'bg-[#C5A265]/12',
    borderColor: 'border-[#C5A265]/35'
  },
  recusada: {
    label: 'Recusada',
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-800',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  },

  // Contratos
  aguardando_assinatura: {
    label: 'Aguardando Assinatura',
    dotColor: 'bg-amber-500',
    dotPulse: true,
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/25'
  },
  assinado: {
    label: 'Assinado & Válido',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  cancelado: {
    label: 'Cancelado',
    dotColor: 'bg-zinc-400',
    textColor: 'text-zinc-600',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/20'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md'
}) => {
  const config = statusMap[status] || {
    label: status,
    dotColor: 'bg-zinc-400',
    textColor: 'text-zinc-700',
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-200'
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium tracking-tight rounded-md border transition-colors ${
        config.bgColor
      } ${config.textColor} ${config.borderColor} ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        {config.dotPulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};
