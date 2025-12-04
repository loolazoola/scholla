import { ClassCohortDetail } from "@/components/admin/class-cohort-detail";

export default async function ClassCohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-8 px-4">
      <ClassCohortDetail classId={id} />
    </div>
  );
}
