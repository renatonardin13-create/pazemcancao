import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModuleGuard } from "@/components/ModuleGuard";
import { getStudentShelves } from "@/lib/shelves.functions";
import { StudentLayout } from "@/components/StudentLayout";
import { useEffect, useState } from "react";
import { VitrinePageContent } from "@/components/vitrine/VitrinePageContent";
import type { VitrineShelf } from "@/components/vitrine/types";

export const Route = createFileRoute("/_authenticated/vitrine")({
  component: VitrinePage,
});

function VitrinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-shelves", "v2"],
    queryFn: () => getStudentShelves(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const shelves: VitrineShelf[] = data?.shelves || [];
  const featuredCourse = data?.featuredCourse;

  useEffect(() => {
    console.log("[DEBUG][VITRINE] routeComponent=VitrinePage");
    console.log("[DEBUG][VITRINE] query=student-shelves:v2");
  }, []);

  return (
    <ModuleGuard moduleKey="vitrine">
      <StudentLayout>
        <VitrinePageContent
          shelves={shelves}
          featuredCourse={featuredCourse}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
        />
      </StudentLayout>
    </ModuleGuard>
  );
}
