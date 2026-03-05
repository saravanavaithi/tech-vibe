import React from 'react';
import { PassengerProfile, Message, RideStatus, Language, RideCurrentStatus } from '../../types';
import Card from '../ui/Card';
import { FaUserShield, FaClipboardList, FaWifi, FaPowerOff } from 'react-icons/fa';
import { l } from '../../services/localization';
import useLocalStorage from '../../hooks/useLocalStorage';

interface DriverViewProps {
  passengerProfile: PassengerProfile;
  rideStatus: RideStatus;
  messageLog: Message[];
}

const DriverView: React.FC<DriverViewProps> = ({ passengerProfile, rideStatus, messageLog }) => {
  const [isOnline, setIsOnline] = useLocalStorage('aura_driverIsOnline', false);
  const T = l(Language.EN); // Driver UI is always in English for simplicity
  const driverInstructions = messageLog
    .map(msg => msg.auraData?.driver_instruction)
    .filter((instr): instr is string => !!instr)
    .reverse();

  const isEmergency = rideStatus.status === RideCurrentStatus.EMERGENCY;

  const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[rgb(var(--color-accent-purple))] ${checked ? 'bg-green-500' : 'bg-gray-600'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className={`p-4 min-h-screen transition-colors ${isEmergency && isOnline ? 'bg-[rgba(var(--color-accent-red),0.7)]' : 'bg-transparent'}`}>
       <Card className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center">
            {isOnline ? <FaWifi className="mr-2 text-green-400" /> : <FaPowerOff className="mr-2 text-gray-400" />}
            Your Status
          </h3>
          <div className="flex items-center space-x-3">
            <span className={`font-bold transition-colors ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <Toggle checked={isOnline} onChange={setIsOnline} />
          </div>
        </div>
      </Card>

      {!isOnline ? (
        <Card className="text-center py-10">
            <h2 className="text-xl font-bold text-white">You Are Offline</h2>
            <p className="text-gray-300 mt-2">Toggle the switch above to go online and start receiving rides.</p>
        </Card>
      ) : (
        <>
            {isEmergency && (
                <Card className="mb-4 text-center animate-pulse-red text-white">
                <h2 className="text-3xl font-extrabold">{T('emergencyAlert')}</h2>
                <p className="text-lg">Passenger has requested emergency assistance.</p>
                </Card>
            )}
            <div className="space-y-4">
                <Card>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <FaUserShield className="mr-2 text-[rgb(var(--color-accent-aqua))]" />
                    <span>{passengerProfile.name}'s {T('assistanceNeeds')}</span>
                </h3>
                {passengerProfile.assistanceNeeds.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-200 space-y-1">
                    {passengerProfile.assistanceNeeds.map((need, index) => (
                        <li key={index}>{need}</li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-gray-300">No specific needs listed.</p>
                )}
                </Card>

                <Card>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center">
                    <FaClipboardList className="mr-2 text-[rgb(var(--color-accent-aqua))]" />
                    {T('instructions')}
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {driverInstructions.length > 0 ? (
                    driverInstructions.map((instr, index) => (
                        <div key={index} className="bg-black/20 p-3 rounded-lg border border-white/10">
                        <p className="text-white">{instr}</p>
                        </div>
                    ))
                    ) : (
                    <p className="text-gray-400">No instructions from Aura yet.</p>
                    )}
                </div>
                </Card>
            </div>
        </>
      )}
    </div>
  );
};

export default DriverView;