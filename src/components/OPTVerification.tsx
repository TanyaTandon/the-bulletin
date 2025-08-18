import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OPTVerification: React.FC<{
  onComplete: (code: string) => void;
}> = ({ onComplete }) => {
  return (
    <InputOTP
      onChange={(e) => {
        if (e.length == 6) {
          onComplete(e);
        }
      }}
      maxLength={6}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};

export default OPTVerification;
