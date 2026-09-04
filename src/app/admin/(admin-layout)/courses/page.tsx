import { getCoursesAction } from '@/app/actions/courseActions';
import CoursesManagerClient from '@/components/admin/CoursesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const courses = await getCoursesAction();

  return <CoursesManagerClient initialCourses={courses} />;
}
