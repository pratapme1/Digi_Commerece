import { AttendeeSpace } from "../../../src/components/attendee-space";

interface PageProps {
  params: Promise<{ qrSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AttendeeSpacePage({ params, searchParams }: PageProps) {
  const { qrSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return <AttendeeSpace initialSearchParams={resolvedSearchParams} qrSlug={qrSlug} />;
}
