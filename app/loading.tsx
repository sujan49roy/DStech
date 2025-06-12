import { Spinner } from '@/components/ui/spinner'; // Import the new Spinner component

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen bg-background text-foreground">
      {/* Using a large size for the global loading spinner */}
      <Spinner size="xl" className="border-primary dark:border-primary" />
    </div>
  );
}