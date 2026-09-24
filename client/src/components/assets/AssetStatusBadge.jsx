import React from 'react';
import { Badge } from '../ui/Badge';

export const AssetStatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'available':
      return <Badge variant="green" dot>Available</Badge>;
    case 'assigned':
      return <Badge variant="blue" dot>Assigned</Badge>;
    case 'under_repair':
      return <Badge variant="amber" dot>Under Repair</Badge>;
    case 'lost':
      return <Badge variant="red" dot>Lost</Badge>;
    case 'retired':
      return <Badge variant="gray">Retired</Badge>;
    case 'disposed':
      return <Badge variant="gray">Disposed</Badge>;
    default:
      return <Badge variant="gray">{status || 'Unknown'}</Badge>;
  }
};
