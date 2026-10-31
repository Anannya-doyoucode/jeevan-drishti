import React, { useState, useEffect } from 'react';
import { updateAlertLifecycle, getAuditTrail } from '../services/api';
import { AuditTrailEntry, UserProfile } from '../types/api';
import { ShieldAlert, X, CheckCircle, Clock, AlertTriangle, ArrowRight, UserCheck, MessageSquare, Send } from 'lucide-react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  districtId: string;
  districtName: string;
  currentAlertState: string;
  alertId: string;
  currentUser: UserProfile;
  onStateUpdated: (newState: string) => void;
}

export const AlertAuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  districtId,
  districtName,
  currentAlertState,
  alertId,
  currentUser,
  onStateUpdated
}) => {
  const [selectedState, setSelectedState] = useState<string>('CONFIRMED');
  const [officerNotes, setOfficerNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<AuditTrailEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAudit();
    }
  }, [isOpen, districtId]);

  const loadAudit = async () => {
    try {
      const records = await getAuditTrail(districtId);
      setAuditLog(records);
    } catch (e) {
      setLoadError("Failed to fetch audit log.");
    }
  };

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const res = await updateAlertLifecycle({
        alert_id: alertId,
        district_id: districtId,
        disease: 'Outbreak Cluster',
        new_state: selectedState as any,
        action_by: currentUser.email,
        role: currentUser.role,
        notes: officerNotes || `Status updated to ${selectedState} by ${currentUser.role}`
      });
      if (res.success) {
        onStateUpdated(res.current_state);
        setOfficerNotes('');
        await loadAudit();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStateBadge = (st: string) => {
    switch (st) {
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-risk-high text-white">CONFIRMED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-white">UNDER_REVIEW</span>;
      case 'DISMISSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-500 text-white">DISMISSED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-risk-low text-white">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500 text-white">NEW</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-govNavy-800 text-white px-6 py-4 flex items-center justify-between border-b border-govNavy-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Governance Alert Lifecycle & Audit Trail
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-govNavy-900 text-amber-400 border border-amber-400/30">
                  {alertId}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official decision record for {districtName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-govNavy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Current Status Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Current Incident Status</div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-2 mt-1">
                {getStateBadge(currentAlertState)}
                <span className="text-xs text-slate-500">IDSP Priority Grade</span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Active Officer: <strong className="text-slate-700">{currentUser.full_name}</strong></div>
              <div className="text-[11px] text-govTeal-700 font-medium">{currentUser.designation}</div>
            </div>
          </div>

          {/* Lifecycle State Modifier Form */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transition Alert State (Statutory IDSP Workflow)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['UNDER_REVIEW', 'CONFIRMED', 'DISMISSED', 'CLOSED'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedState(st)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all border text-center ${
                    selectedState === st
                      ? 'bg-govNavy-800 text-white border-govNavy-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Officer Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Epidemiological Officer Triage Notes / Laboratory Findings:
              </label>
              <textarea
                rows={3}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="E.g., Field rapid antigen NS1 test confirmed 22 positive cases. Directed PHC Medical Officer to mobilize fogging and dispatch Asha workers..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govTeal-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-govNavy-800 hover:bg-govNavy-700 text-govTeal-300 flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Recording Transition...' : 'Commit Lifecycle Transition'}</span>
              </button>
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Immutable Governance Audit Log
            </h3>
            <div className="space-y-3">
              {auditLog.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-2">No historical audit entries found for this alert.</div>
              ) : (
                auditLog.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold">
                        {getStateBadge(log.previous_state)}
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        {getStateBadge(log.new_state)}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </div>
                    <div className="text-slate-600 leading-snug">
                      {log.notes}
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Action by: <strong className="text-slate-700">{log.action_by}</strong> ({log.role})</span>
                      <span className="font-mono text-govTeal-700">Audit ID #{log.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
