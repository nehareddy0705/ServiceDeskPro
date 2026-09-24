import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { User, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { ticketService } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';

export const AssignTechnicianModal = ({
  isOpen,
  onClose,
  ticketId,
  currentAssigneeId,
  onAssigned,
}) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      userService
        .getUsers({ role: 'technician', isActive: true })
        .then((res) => {
          const list = res.users || [];
          setTechnicians(list);
          if (list.length > 0 && !selectedTechId) {
            setSelectedTechId(currentAssigneeId || list[0]._id);
          }
        })
        .catch((err) => {
          console.error('Failed to load technicians:', err);
          toast.error('Unable to load technicians list.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentAssigneeId]);

  const handleAssign = async () => {
    if (!selectedTechId) return;
    setSubmitting(true);
    try {
      const updated = await ticketService.updateTicket(ticketId, {
        assignedTo: selectedTechId,
      });
      toast.success('Technician assigned successfully.');
      if (onAssigned) onAssigned(updated);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Ticket to Technician"
      description="Select an active technician to assign this ticket."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAssign}
            loading={submitting}
            disabled={!selectedTechId}
          >
            Confirm Assignment
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading available technicians...</span>
        </div>
      ) : technicians.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          No active technicians available in the system.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700">
            Available Technicians ({technicians.length})
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {technicians.map((tech) => {
              const isSelected = selectedTechId === tech._id;
              const isCurrent = currentAssigneeId === tech._id;

              return (
                <div
                  key={tech._id}
                  onClick={() => setSelectedTechId(tech._id)}
                  className={`p-2.5 rounded border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center border-slate-400">
                      {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {tech.name}
                        {isCurrent && (
                          <span className="text-[10px] text-slate-400 font-normal">(Current)</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tech.email} · {tech.department?.name || 'Technical Support'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {tech.employeeId || 'Technician'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};
