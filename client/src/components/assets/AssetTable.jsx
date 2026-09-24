import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableRow, TableCell } from '../ui/Table';
import { AssetStatusBadge } from './AssetStatusBadge';

export const AssetTable = ({ assets = [] }) => {
  const navigate = useNavigate();

  const columns = [
    { header: 'Asset Tag', className: 'w-28' },
    { header: 'Asset Name & Model' },
    { header: 'Type', className: 'w-28' },
    { header: 'Assigned To', className: 'w-40' },
    { header: 'Department', className: 'w-36' },
    { header: 'Status', className: 'w-28' },
  ];

  return (
    <Table columns={columns}>
      {assets.map((asset) => (
        <TableRow
          key={asset._id}
          onClick={() => navigate(`/assets/${asset._id}`)}
          className="hover:bg-slate-50 transition-colors"
        >
          <TableCell>
            <span className="font-mono text-xs font-semibold text-slate-800">
              {asset.assetTag}
            </span>
          </TableCell>
          <TableCell>
            <div className="font-medium text-slate-900">{asset.name}</div>
            <div className="text-[11px] text-slate-400">
              SN: {asset.serialNumber || '—'} · {asset.brand || ''} {asset.model || ''}
            </div>
          </TableCell>
          <TableCell>
            <span className="capitalize text-slate-700 text-xs font-medium">
              {asset.type?.replace('_', ' ')}
            </span>
          </TableCell>
          <TableCell>
            {asset.assignedTo ? (
              <span className="text-slate-800 text-xs font-medium">
                {asset.assignedTo.name}
              </span>
            ) : (
              <span className="text-slate-400 text-xs">—</span>
            )}
          </TableCell>
          <TableCell>
            <span className="text-slate-600 text-xs">
              {asset.department?.name || '—'}
            </span>
          </TableCell>
          <TableCell>
            <AssetStatusBadge status={asset.status} />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
