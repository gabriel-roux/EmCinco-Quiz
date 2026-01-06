import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Return Home
        </Link>
      </div>
    </div>
  );
}
