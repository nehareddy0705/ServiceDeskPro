import React from 'react';
import { Badge } from '../ui/Badge';

export const TicketPriorityBadge = ({ priority }) => {
  const normalized = (priority || '').toLowerCase();

  switch (normalized) {
    case 'critical':
      return <Badge variant="red">Critical</Badge>;
    case 'high':
      return <Badge variant="amber">High</Badge>;
    case 'medium':
      return <Badge variant="blue">Medium</Badge>;
    case 'low':
      return <Badge variant="gray">Low</Badge>;
    default:
      return <Badge variant="gray">{priority || 'Normal'}</Badge>;
  }
};
