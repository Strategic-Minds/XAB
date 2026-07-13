"use client";

import * as React from "react";
import { 
  Phone, Users, Play, Pause, SkipForward, CheckCircle2, XCircle, 
  Clock, Flame, HelpCircle, History, MessageSquare, AlertCircle, 
  Plus, Settings, Volume2, Mic, VolumeX, MicOff, Search, Calendar,
  CheckCircle, RefreshCw, Briefcase, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  localTime: string;
  lastInteraction: string;
  status: "Hot" | "Warm" | "Cold";
}

const initialQueue: Contact[] = [
  { id: "1", name: "Marcus Vance", company: "Apex Flooring Partners", phone: "+1 (512) 555-0192", localTime: "10:53 AM", lastInteraction: "Opened email 2 hours ago", status: "Hot" },
  { id: "2", name: "Elena Rostova", company: "Vanguard Epoxy Systems", phone: "+1 (415) 888-0241", localTime: "7:53 AM", lastInteraction: "No previous calls logged", status: "Hot" },
  { id: "3", name: "John Miller", company: "Summit Concrete Solutions", phone: "+1 (312) 444-0130", localTime: "9:53 AM", lastInteraction: "Left voicemail 3 days ago", status: "Warm" },
  { id: "4", name: "Dave Batista", company: "Titan Industrial Coatings", phone: "+1 (201) 333-0182", localTime: "10:53 AM", lastInteraction: "Replied to email last night", status: "Hot" },
  { id: "5", name: "Alan Shore", company: "Blue Pacific Construction", phone: "+1 (617) 222-0941", localTime: "10:53 AM", lastInteraction: "Called; line was busy", status: "Warm" },
  { id: "6", name: "Sarah Connor", company: "NextGen Warehouses", phone: "+1 (702) 777-1029", localTime: "7:53 AM", lastInteraction: "Initial import from Apollo", status: "Cold" },
  { id: "7", name: "Ryan Reynolds", company: "Dallas Epoxy Tech", phone: "+1 (214) 999-2311", localTime: "9:53 AM", lastInteraction: "Meeting requested by lead", status: "Hot" },
  { id: "8", name: "Christian Bale", company: "Empire Building Group", phone: "+1 (646) 333-4011", localTime: "10:53 AM", lastInteraction: "No activity in 14 days", status: "Warm" }
];

interface CallHistoryItem {
  id: string;
  name: string;
  company: string;
  duration: string;
  outcome: string;
  time: string;
}

export default function DialerClient() {
  const [queue, setQueue] = React.useState<Contact[]>(initialQueue);
  const [currentIdx, setCurrentIdx] = React.useState<number>(0);
  const [callStatus, setCallStatus] = React.useState<"Ready" | "Calling" | "Connected" | "Ended">("Ready");
  const [callTimer, setCallTimer] = React.useState<number>(0);
  const [callNotes, setCallNotes] = React.useState<string>("");
  const [disposition, setDisposition] = React.useState<string>("");
  const [nextAction, setNextAction] = React.useState<string>("Follow Up Sequence");
  
  // Audio Control Mock States
  const [isMuted, setIsMuted] = React.useState(false);
  const [isSpeakerOn, setIsMinterOn] = React.useState(true);

  // Call History
  const [history, setHistory] = React.useState<CallHistoryItem[]>([
    { id: "101", name: "Tony Stark", company: "Precision Epoxy Design", duration: "2m 14s", outcome: "Interested / Callback Set", time: "10:15 AM" },
    { id: "102", name: "Bruce Wayne", company: "Oakridge Real Estate", duration: "0m 45s", outcome: "No Answer / Left VM", time: "9:42 AM" },
    { id: "103", name: "Clark Kent", company: "Greenfield Contractors", duration: "1m 12s", outcome: "Not Interested", time: "9:10 AM" }
  ]);

  // Today's Aggregate Stats
  const [stats, setStats] = React.useState({
    callsToday: 18,
    connected: 11,
    avgTalkTime: "1m 45s",
    meetingsBooked: 3
  });

  const activeContact = queue[currentIdx] || null;

  // Call Timer Effect
  React.useEffect(() => {
    let interval: any;
    if (callStatus === "Calling" || callStatus === "Connected") {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleStartCall = () => {
    if (!activeContact) return;
    setCallTimer(0);
    setCallStatus("Calling");
    setCallNotes("");
    setDisposition("");

    // Simulate connecting in 2.5 seconds
    setTimeout(() => {
      setCallStatus("Connected");
    }, 2500);
  };

  const handleEndCall = () => {
    setCallStatus("Ended");
  };

  const handleSkip = () => {
    if (currentIdx < queue.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCallStatus("Ready");
      setCallTimer(0);
    }
  };

  const handleLogNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact) return;

    // Log call outcome
    const newLog: CallHistoryItem = {
      id: Date.now().toString(),
      name: activeContact.name,
      company: activeContact.company,
      duration: formatTime(callTimer),
      outcome: disposition || "Completed Call",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory([newLog, ...history]);

    // Update stats
    setStats(prev => ({
      ...prev,
      callsToday: prev.callsToday + 1,
      connected: callTimer > 5 ? prev.connected + 1 : prev.connected,
      meetingsBooked: disposition === "Interested" ? prev.meetingsBooked + 1 : prev.meetingsBooked
    }));

    // Advance queue
    if (currentIdx < queue.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Re-seed or start over for queue continuity
      setCurrentIdx(0);
    }

    // Reset states
    setCallStatus("Ready");
    setCallTimer(0);
    setCallNotes("");
    setDisposition("");
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs < 10 ? '0' : ''}${remainingSecs}s`;
  };

  const dialerButtons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "*", "0", "#"
  ];

  return (
    <div className="flex-1 overflow-auto bg-black text-white p-6 space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Phone className="w-6 h-6 text-indigo-500 animate-bounce" />
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-indigo-400 bg-clip-text text-transparent">
              Power Dialer Queue
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1">
            Accelerate your warm outbound calling using our integrated local times database and dial patterns.
          </p>
        </div>

        {/* Twilio warning badge */}
        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-400 px-3 py-1 flex items-center gap-2 text-xs font-semibold rounded-lg shadow-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Connect Twilio in Settings to enable live calling</span>
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.02] border-white/5 shadow-inner">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Calls Today</span>
              <p className="text-lg font-bold text-white mt-0.5">{stats.callsToday}</p>
            </div>
            <Phone className="w-4 h-4 text-indigo-400 opacity-60" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 shadow-inner">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Connected</span>
              <p className="text-lg font-bold text-white mt-0.5">{stats.connected}</p>
            </div>
            <Volume2 className="w-4 h-4 text-indigo-400 opacity-60" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 shadow-inner">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Avg Talk Time</span>
              <p className="text-lg font-bold text-indigo-400 mt-0.5">{stats.avgTalkTime}</p>
            </div>
            <Clock className="w-4 h-4 text-indigo-400 opacity-60" />
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5 shadow-inner">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Meetings Set</span>
              <p className="text-lg font-bold text-white mt-0.5">{stats.meetingsBooked}</p>
            </div>
            <Star className="w-4 h-4 text-amber-400 opacity-60" />
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Queue, Dialpad, Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Call Queue */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="bg-white/[0.02] border-white/5 flex-1 flex flex-col overflow-hidden max-h-[500px]">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-white/[0.01]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Active Queue ({queue.length})
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03] select-none">
              {queue.map((contact, idx) => (
                <div
                  key={contact.id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setCallStatus("Ready");
                    setCallTimer(0);
                  }}
                  className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer transition-all duration-150 ${
                    idx === currentIdx 
                      ? "bg-indigo-600/10 border-l-2 border-indigo-500" 
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                      {contact.status === "Hot" && (
                        <Badge className="bg-red-500/10 border-red-500/20 text-red-400 text-[8px] px-1 py-0 rounded font-semibold">
                          HOT
                        </Badge>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-medium truncate">{contact.company}</div>
                    <div className="text-[9px] text-neutral-500 flex items-center gap-1 font-mono pt-1">
                      <Clock className="w-2.5 h-2.5" /> Local: {contact.localTime}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-semibold text-indigo-400 font-mono">{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center: Dialer Pad */}
        <div className="lg:col-span-4">
          <Card className="bg-white/[0.02] border-white/5 h-full flex flex-col justify-between">
            <CardHeader className="pb-2 border-b border-white/[0.04]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Outbound Terminal
              </CardTitle>
            </CardHeader>
            
            <CardContent className="py-4 space-y-4 flex-1 flex flex-col justify-between">
              {activeContact ? (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-base mx-auto shadow-inner">
                    {activeContact.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeContact.name}</h3>
                    <p className="text-[11px] text-neutral-500 font-medium">{activeContact.company}</p>
                    <p className="text-xs text-indigo-400 font-mono font-bold mt-1.5">{activeContact.phone}</p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1.5">
                    {callStatus === "Calling" && (
                      <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                        Ringing Line...
                      </Badge>
                    )}
                    {callStatus === "Connected" && (
                      <Badge className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        Live Call ({formatTime(callTimer)})
                      </Badge>
                    )}
                    {callStatus === "Ended" && (
                      <Badge className="bg-neutral-800 text-neutral-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                        Call Ended
                      </Badge>
                    )}
                    {callStatus === "Ready" && (
                      <Badge className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                        Ready To Connect
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                  <p className="text-xs">No active prospect selected</p>
                </div>
              )}

              {/* Pad Buttons */}
              <div className="grid grid-cols-3 gap-2 mx-auto max-w-[200px] pt-2">
                {dialerButtons.map(btn => (
                  <button 
                    key={btn} 
                    className="w-11 h-11 rounded-full border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.07] text-white font-mono text-sm font-bold flex items-center justify-center transition-all duration-100 cursor-pointer active:scale-95 shadow-inner"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* Micro / Mute Line controls */}
              <div className="flex items-center justify-center gap-4 pt-3 border-t border-white/[0.03]">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    isMuted 
                      ? "bg-red-500/15 border-red-500/35 text-red-400" 
                      : "bg-white/[0.01] border-white/[0.04] text-neutral-400 hover:text-white"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsMinterOn(!isSpeakerOn)} 
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    !isSpeakerOn 
                      ? "bg-red-500/15 border-red-500/35 text-red-400" 
                      : "bg-white/[0.01] border-white/[0.04] text-neutral-400 hover:text-white"
                  }`}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </CardContent>

            <CardFooter className="p-3 bg-white/[0.01] border-t border-white/[0.04] flex items-center gap-3">
              {callStatus === "Ready" || callStatus === "Ended" ? (
                <Button 
                  onClick={handleStartCall} 
                  disabled={!activeContact}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-2" /> Start Live Dial
                </Button>
              ) : (
                <Button 
                  onClick={handleEndCall} 
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer"
                >
                  <Phone className="w-4 h-4 mr-2" /> End Call
                </Button>
              )}
              <Button 
                onClick={handleSkip} 
                variant="outline" 
                className="border-white/10 hover:bg-white/[0.03] text-neutral-300 cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Side: Call Notes & Disposition */}
        <div className="lg:col-span-4">
          <Card className="bg-white/[0.02] border-white/5 h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/[0.04] bg-white/[0.01]">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Outcome Disposition & Notes
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleLogNotes} className="flex-1 flex flex-col justify-between">
              <CardContent className="py-4 space-y-4 flex-1">
                {/* Disposition selectors */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Call Disposition</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Interested", "Not Interested", 
                      "Callback Set", "No Answer", 
                      "Left Voicemail", "Wrong Number"
                    ].map(disp => (
                      <button
                        key={disp}
                        type="button"
                        onClick={() => setDisposition(disp)}
                        className={`px-2.5 py-1.5 rounded-lg border text-left text-xs font-semibold transition-all cursor-pointer ${
                          disposition === disp 
                            ? "bg-indigo-600/10 border-indigo-500 text-indigo-300" 
                            : "bg-white/[0.01] border-white/[0.03] hover:border-white/[0.08] text-neutral-300"
                        }`}
                      >
                        {disp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Call Notes Textarea */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Call Note</label>
                  <textarea
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 min-h-[90px] flex-1 resize-none"
                    placeholder="Log detail notes of the call (e.g. asked for invoice to be resent, set follow up next Tuesday...)"
                  />
                </div>

                {/* Next action selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Trigger Next Pipeline Step</label>
                  <select
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Follow Up Sequence">Start Follow Up Email Sequence</option>
                    <option value="Trigger Calendar Link">Send Calendar Link via SMS</option>
                    <option value="Add to Re-engagement Hub">Schedule Re-engagement Call (30d)</option>
                    <option value="None">Keep in Active Dialer Queue</option>
                  </select>
                </div>
              </CardContent>

              <CardFooter className="p-3 bg-white/[0.01] border-t border-white/[0.04]">
                <Button 
                  type="submit" 
                  disabled={!disposition && !callNotes}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-medium cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Save Notes & Go to Next
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

      </div>

      {/* Call History Feed */}
      <Card className="bg-white/[0.01] border-white/5">
        <CardHeader className="pb-3 border-b border-white/[0.03]">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Logged Calls Terminal History
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.03] text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
                <th className="p-3 pl-4">Prospect</th>
                <th className="p-3">Company</th>
                <th className="p-3">Outcome Status</th>
                <th className="p-3 font-mono">Talk Time</th>
                <th className="p-3 pr-4 text-right">Time Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-xs">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01]">
                  <td className="p-3 pl-4 font-bold text-neutral-200">{log.name}</td>
                  <td className="p-3 text-neutral-400 font-medium">{log.company}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] bg-indigo-950/20 text-indigo-300 border-indigo-500/20 font-semibold px-2 py-0.5 rounded">
                      {log.outcome}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono font-semibold text-neutral-300">{log.duration}</td>
                  <td className="p-3 pr-4 text-right text-neutral-500 font-medium">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
