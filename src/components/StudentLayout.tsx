import { StudentSidebar } from "./StudentSidebar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <StudentSidebar />
      <main className="flex-1 min-w-0 pt-[60px] md:pt-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
