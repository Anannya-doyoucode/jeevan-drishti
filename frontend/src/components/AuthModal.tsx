import React from 'react';
import { UserProfile } from '../types/api';
import { UserCheck, X, Shield, Building, Stethoscope, CheckCircle, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const AVAILABLE_USERS: UserProfile[] = [
  {
    id: "usr-dso-pune",
    email: "dso.pune@maharashtra.gov.in",
    full_name: "Dr. Rajesh G. Deshmukh",
    designation: "District Surveillance Officer (DSO)",
    role: "DSO",
    jurisdiction: "Pune District (98 PHCs)",
    badge_label: "District Surveillance Officer",
    avatar_color: "#2DD4BF"
  },
  {
    id: "usr-phc-haveli",
    email: "phc.haveli@maharashtra.gov.in",
    full_name: "Dr. Snehal Patil",
    designation: "Medical Officer - Haveli PHC",
    role: "PHC_OFFICER",
    jurisdiction: "Haveli & Wagholi Sub-Centers",
    badge_label: "PHC Field Officer",
    avatar_color: "#E9B949"
  },
  {
    id: "usr-state-admin",
    email: "admin.idsp@maharashtra.gov.in",
    full_name: "Dr. Pradeep Vyas (IAS / Epidemiologist)",
    designation: "State Director - Integrated Disease Surveillance",
    role: "STATE_ADMIN",
    jurisdiction: "State of Maharashtra (36 Districts)",
    badge_label: "State Health Command",
    avatar_color: "#E76F51"
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DSO':
        return <Shield className="w-5 h-5 text-govTeal-600" />;
      case 'PHC_OFFICER':
        return <Stethoscope className="w-5 h-5 text-amber-600" />;
      default:
        return <Building className="w-5 h-5 text-risk-high" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-govNavy-800 text-white px-6 py-4 flex items-center justify-between border-b border-govNavy-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-govTeal-500/20 text-govTeal-300 border border-govTeal-400/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Role-Based Officer Portal & Persona Switcher
              </h2>
              <p className="text-xs text-slate-300">
                Government of Maharashtra Health Intelligence Access Control
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
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Select a verified public health authority profile to inspect access levels, review operational alerts, and dispatch emergency broadcasts:
          </p>

          <div className="space-y-3">
            {AVAILABLE_USERS.map((usr) => {
              const isActive = usr.id === currentUser.id;
              return (
                <div
                  key={usr.id}
                  onClick={() => {
                    onSelectUser(usr);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'border-govTeal-500 bg-govTeal-50/50 shadow-md ring-2 ring-govTeal-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-govNavy-900 shadow-sm"
                      style={{ backgroundColor: usr.avatar_color }}
                    >
                      {getRoleIcon(usr.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {usr.full_name}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {usr.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono">
                        {usr.email}
                      </div>
                      <div className="text-[11px] text-govTeal-700 font-medium mt-0.5">
                        Jurisdiction: {usr.jurisdiction}
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-govTeal-700 bg-govTeal-100 px-2.5 py-1 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-govTeal-600" />
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 hover:text-slate-700">
                      Switch Persona →
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              All actions committed under this persona are cryptographically stamped into the immutable SQLite / PostGIS governance audit trail.
            </span>
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
