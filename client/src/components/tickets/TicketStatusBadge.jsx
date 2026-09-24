import React from 'react';
import { Badge } from '../ui/Badge';

export const TicketStatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'open':
      return <Badge variant="blue" dot>Open</Badge>;
    case 'assigned':
      return <Badge variant="blue" dot>Assigned</Badge>;
    case 'in_progress':
      return <Badge variant="amber" dot>In Progress</Badge>;
    case 'pending':
      return <Badge variant="amber" dot>Pending</Badge>;
    case 'resolved':
      return <Badge variant="green" dot>Resolved</Badge>;
    case 'closed':
      return <Badge variant="gray">Closed</Badge>;
    case 'reopened':
      return <Badge variant="red" dot>Reopened</Badge>;
    default:
      return <Badge variant="gray">{status || 'Unknown'}</Badge>;
  }
};
