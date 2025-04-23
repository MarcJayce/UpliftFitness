import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-background rounded-lg border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-poppins font-semibold text-2xl text-primary">Terms & Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] px-6 py-4">
          <div className="prose dark:prose-invert space-y-6">
            <h2 className="font-poppins font-semibold text-xl text-primary">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Uplift app, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately.
            </p>
            
            <h2 className="font-poppins font-semibold text-xl text-primary">2. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed">
             You are responsible for maintaining the confidentiality of your account and ensuring the security of your login credentials. Any unauthorized access or use of your account should be reported immediately.
            </p>
            
            <h2 className="font-poppins font-semibold text-xl text-primary">3. Health Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
             Uplift provides general fitness tracking features, including calorie counting and workout tracking. However, it does not offer medical advice. Users should consult healthcare professionals before starting any new diet or exercise regimen.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">4. Data Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
             Your personal data, including workout records and calorie intake, will be stored securely. Uplift does not sell user data to third parties. For more details, refer to our Privacy Policy.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">5. App Usage Restrictions</h2>
            <p className="text-muted-foreground leading-relaxed">
             Users must not misuse the app, including attempting unauthorized access, reverse engineering, or distributing harmful content that may disrupt the app’s functionality.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">6. Subscription & Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
             Some features may require a subscription. Payments are non-refundable except as required by law. Users can manage subscriptions through their respective app stores.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">7. Modifications to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
             Uplift reserves the right to modify these Terms & Conditions at any time. Continued use of the app after changes are made constitutes acceptance of the revised terms.
            </p>
            {/* Add more sections as needed */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
