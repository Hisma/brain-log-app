import { auth, signOut } from "../../../auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Shield } from "lucide-react";

export default async function PendingPage() {
  const session = await auth();
  
  // Redirect if not authenticated or not pending
  if (!session?.user) {
    redirect("/login");
  }
  
  if (session.user.role !== "PENDING") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-fit">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending Approval</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Your account has been created successfully and is awaiting administrator approval.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Security Review</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All new accounts undergo a security review process to ensure platform safety.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Email Notification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You will receive an email notification once your account is approved.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Administrator will review your account</li>
              <li>• You&apos;ll receive approval notification via email</li>
              <li>• Once approved, you can access all features</li>
            </ul>
          </div>
          
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help or have questions about your account?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Contact support at{" "}
              <a 
                href="mailto:admin@brainlogapp.com" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                admin@brainlogapp.com
              </a>
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="outline" type="submit" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
