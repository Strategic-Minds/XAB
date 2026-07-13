import DialerClient from "@/components/dialer/DialerClient";

export const metadata = {
  title: "Power Dialer | XAB",
  description: "High velocity outreach queue integrated with Twilio client lines and notes logging.",
};

export default function DialerPage() {
  return <DialerClient />;
}
