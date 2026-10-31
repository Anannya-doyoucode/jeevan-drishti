import React, { useState } from 'react';
import { dispatchCellBroadcast } from '../services/api';
import { BroadcastDispatchResponse, UserProfile } from '../types/api';
import { Radio, X, Send, ShieldAlert, CheckCircle, TowerControl, Users, Code, Eye, AlertOctagon } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  districtId: string;
  districtName: string;
  currentUser: UserProfile;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  districtId,
  districtName,
  currentUser
}) => {
  const [hazard, setHazard] = useState<string>('Dengue Outbreak');
  const [severity, setSeverity] = useState<string>('Severe');
  const [selectedWards, setSelectedWards] = useState<string[]>([
    'Haveli Rural Cluster',
    'Kothrud Ward 12',
    'Hadapsar Industrial Belt'
  ]);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<BroadcastDispatchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'PREVIEW' | 'CAP_XML' | 'CAP_JSON'>('PREVIEW');

  if (!isOpen) return null;

  const availableWards = [
    'Haveli Rural Cluster',
    'Kothrud Ward 12',
    'Hadapsar Industrial Belt',
    'Sinhagad Road Basin',
    'Wagholi Peri-Urban Sector',
    'Kasba Peth Dense Core'
  ];

  const toggleWard = (ward: string) => {
    if (selectedWards.includes(ward)) {
      setSelectedWards(selectedWards.filter(w => w !== ward));
    } else {
      setSelectedWards([...selectedWards, ward]);
    }
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    try {
      const res = await dispatchCellBroadcast({
        district_id: districtId,
        disease_hazard: hazard,
        alert_severity: severity,
        target_wards: selectedWards.length > 0 ? selectedWards : ['Entire District'],
        dispatched_by: currentUser.email
      });
      setDispatchResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-govNavy-800 text-white px-6 py-4 flex items-center justify-between border-b border-govNavy-700">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-risk-high/20 text-risk-high border border-risk-high/40 animate-pulse">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  C-DoT / SACHET Emergency Cell Broadcast Dispatcher
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-risk-high text-white">
                  CAP v1.2 Standard
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Targeted geo-fenced cellular tower broadcast for {districtName}
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Dispatcher State: Form vs Success Receipt */}
          {!dispatchResult ? (
            <>
              {/* Target Hazard & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Disease Hazard
                  </label>
                  <select
                    value={hazard}
                    onChange={(e) => setHazard(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-govTeal-400"
                  >
                    <option value="Dengue Outbreak">Dengue Outbreak (Vector-Borne)</option>
                    <option value="Cholera / Water Contamination">Cholera / Drinking Water Alert</option>
                    <option value="Extreme Heatwave">Extreme Heatwave (Thermal Stress)</option>
                    <option value="Leptospirosis Alert">Leptospirosis Floodwater Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alert Urgency & Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-govTeal-400"
                  >
                    <option value="Extreme">Extreme (Mandatory Broadcast Tone)</option>
                    <option value="Severe">Severe (Urgent Public Advisory)</option>
                    <option value="Moderate">Moderate (Preventive Advisory)</option>
                  </select>
                </div>
              </div>

              {/* Target Wards Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Geo-Fenced Wards & PHC Clusters ({selectedWards.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableWards.map((w) => {
                    const isChecked = selectedWards.includes(w);
                    return (
                      <div
                        key={w}
                        onClick={() => toggleWard(w)}
                        className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-govNavy-800 text-white border-govNavy-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{w}</span>
                        {isChecked && <CheckCircle className="w-3.5 h-3.5 text-govTeal-400 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Reach Estimates */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Estimated Citizen Reach</div>
                    <div className="text-base font-black font-mono text-slate-800">
                      ~{(selectedWards.length * 140000).toLocaleString()} Citizens
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <TowerControl className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Activated Cell Towers</div>
                    <div className="text-base font-black font-mono text-slate-800">
                      {selectedWards.length * 12 + 6} Transceivers
                    </div>
                  </div>
                </div>
              </div>

              {/* Bilingual Message Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Bilingual Broadcast Payload Preview
                </h4>

                {/* Marathi preview */}
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                    मराठी संदेश (Official Marathi Channel)
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    ⚠️ सार्वजनिक आरोग्य इशारा ({districtName}): आरोग्य विभागामार्फत निवडक प्रभागांमध्ये साथरोगाचा वाढता धोका नोंदवला आहे. कृपया पाणी उकळून प्या, साठवलेले पाणी रिकामे करा आणि ताप आढळल्यास जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) संपर्क साधा.
                  </p>
                </div>

                {/* English preview */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    English Payload (Standard Channel)
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    URGENT HEALTH ADVISORY ({districtName}): Outbreak surveillance indicates high pathogen transmission index. Eliminate stagnant water containers and report persistent fever to your nearest PHC immediately.
                  </p>
                </div>
              </div>

              {/* Officer Authorization Confirmation */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Authorized Dispatch Officer: <strong className="text-slate-800">{currentUser.full_name}</strong> ({currentUser.email})</span>
                <span className="font-mono text-[10px] text-govTeal-700 bg-govTeal-50 px-2 py-0.5 rounded border border-govTeal-200">Verified DSO Token</span>
              </div>
            </>
          ) : (
            /* Successful Dispatch View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    C-DoT Cell Broadcast Payload Dispatched Successfully
                  </h3>
                  <p className="text-xs text-emerald-700">
                    Broadcast ID: <strong className="font-mono">{dispatchResult.broadcast_id}</strong> • Transmitted to state telecom gateway.
                  </p>
                </div>
              </div>

              {/* Tabs for Preview, XML, and JSON */}
              <div className="flex space-x-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveTab('PREVIEW')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'PREVIEW' ? 'bg-govNavy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" />
                  Live Preview
                </button>
                <button
                  onClick={() => setActiveTab('CAP_XML')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'CAP_XML' ? 'bg-govNavy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1" />
                  CAP v1.2 XML
                </button>
                <button
                  onClick={() => setActiveTab('CAP_JSON')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'CAP_JSON' ? 'bg-govNavy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Code className="w-3.5 h-3.5 inline mr-1" />
                  JSON Payload
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'PREVIEW' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Marathi Message Dispatched:</span>
                    <p className="text-slate-800 font-medium">{dispatchResult.marathi_message}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">English Message Dispatched:</span>
                    <p className="text-slate-800">{dispatchResult.english_message}</p>
                  </div>
                  <div className="text-xs text-slate-500 flex justify-between">
                    <span>Activated Towers: <strong>{dispatchResult.cell_towers_activated}</strong></span>
                    <span>Target Population: <strong>{dispatchResult.estimated_population.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {activeTab === 'CAP_XML' && (
                <pre className="p-3 rounded-lg bg-govNavy-900 text-govTeal-300 font-mono text-[11px] overflow-x-auto max-h-64 border border-govNavy-700">
                  {dispatchResult.cap_xml_payload}
                </pre>
              )}

              {activeTab === 'CAP_JSON' && (
                <pre className="p-3 rounded-lg bg-govNavy-900 text-govTeal-300 font-mono text-[11px] overflow-x-auto max-h-64 border border-govNavy-700">
                  {JSON.stringify(dispatchResult.cap_json_payload, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            {dispatchResult ? 'Close' : 'Cancel'}
          </button>

          {!dispatchResult ? (
            <button
              onClick={handleDispatch}
              disabled={isDispatching || selectedWards.length === 0}
              className="px-5 py-2 text-xs font-bold rounded-lg bg-risk-high hover:bg-opacity-90 text-white flex items-center gap-1.5 shadow-md shadow-risk-high/30 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDispatching ? 'Transmitting to C-DoT...' : 'Dispatch Cell Broadcast Now'}</span>
            </button>
          ) : (
            <button
              onClick={() => setDispatchResult(null)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-govNavy-800 text-white hover:bg-govNavy-700 transition-colors"
            >
              Dispatch Another Alert
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
