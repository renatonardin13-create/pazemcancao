import { StudentSidebar } from "./StudentSidebar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#0b0b0b]">
      <StudentSidebar />
      <main className="flex-1 min-w-0 pt-[60px] md:pt-0 pb-[140px] overflow-x-hidden overflow-y-visible">
        {children}
      </main>
    </div>
  );
}
