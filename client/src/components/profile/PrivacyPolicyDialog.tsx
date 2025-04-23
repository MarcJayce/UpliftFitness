import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] bg-background rounded-lg border border-border shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-poppins font-semibold text-2xl text-primary">Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[80vh] px-6 py-4">
          <div className="prose dark:prose-invert space-y-6">
            <h2 className="font-poppins font-semibold text-xl text-primary">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect personal information that you provide when creating an account, including your name, email, and fitness preferences. Additionally, we may gather usage data such as workout logs, calorie intake, and app interactions to enhance your experience.
            </p>
            
            <h2 className="font-poppins font-semibold text-xl text-primary">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
             Your information is used to enhance your fitness experience by providing tailored workout recommendations based on your goals and preferences. It helps track your progress, analyze user behavior, and refine the app’s features to ensure an optimized experience. Additionally, we use your information to communicate important updates, promotions, and relevant news about Uplift, keeping you informed about new offerings and improvements.
            </p>
            
            <h2 className="font-poppins font-semibold text-xl text-primary">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your personal information from unauthorized access, modification, or disclosure. While we strive to safeguard your data, users are encouraged to maintain strong passwords and take additional precautions.
            </p>
            
            <h2 className="font-poppins font-semibold text-xl text-primary">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Uplift may utilize third-party analytics and service providers to improve functionality. These third parties may collect anonymous data to help enhance the app experience, but we do not sell or share personally identifiable information without explicit consent.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">5. User Rights & Data Control</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to review, update, or delete your personal data. If you wish to make changes to your information or request data deletion, contact our support team through the app profile page.
            </p>

            <h2 className="font-poppins font-semibold text-xl text-primary">6. Changes to this Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Uplift reserves the right to update this Privacy Policy as needed. Users will be notified of significant changes, and continued use of the app constitutes acceptance of the revised policy.
            </p>
            
            {/* Add more sections as needed */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}