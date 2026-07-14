'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { Plus, ChevronDown, ChevronUp, Edit, Trash2, Video, FileText } from 'lucide-react';
import { ChapterForm } from '@/components/courses/ChapterForm';
import { LessonForm } from '@/components/courses/LessonForm';

interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: 'draft' | 'published';
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: 'draft' | 'published';
  video: {
    type: string;
    url: string;
  };
}

export default function CourseDetailPage({ params }: { params: { tenantSlug: string; courseId: string } }) {
  const { tenantSlug, courseId } = params;
  const { tenant } = useTenant(tenantSlug);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // حالات النماذج
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null); // chapterId
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: any } | null>(null);

  useEffect(() => {
    if (tenant) {
      fetchCourseData();
    }
  }, [tenant, courseId]);

  const fetchCourseData = async () => {
    if (!tenant) return;
    try {
      setIsLoading(true);
      const [courseData, chaptersData] = await Promise.all([
        courseService.getCourse(tenant.id, courseId),
        courseService.getChapters(tenant.id, courseId),
      ]);
      
      setCourse(courseData);
      
      // جلب الدروس لكل فصل
      const chaptersWithLessons = await Promise.all(
        chaptersData.map(async (chapter: any) => {
          const lessons = await courseService.getLessons(tenant.id, courseId, chapter.id);
          return { ...chapter, lessons };
        })
      );
      
      setChapters(chaptersWithLessons);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleCreateChapter = async (data: any) => {
    if (!tenant) return;
    try {
      await courseService.createChapter(tenant.id, courseId, data);
      setShowChapterForm(false);
      await fetchCourseData();
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const handleCreateLesson = async (chapterId: string, data: any) => {
    if (!tenant) return;
    try {
      await courseService.createLesson(tenant.id, courseId, chapterId, data);
      setShowLessonForm(null);
      await fetchCourseData();
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل وجميع دروسه؟')) return;
    if (!tenant) return;
    try {
      await courseService.deleteChapter(tenant.id, courseId, chapterId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    if (!tenant) return;
    try {
      await courseService.deleteLesson(tenant.id, courseId, chapterId, lessonId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-12">الكورس غير موجود</div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/${tenantSlug}/courses`} className="text-sm text-primary hover:underline">
            ← العودة إلى الكورسات
          </Link>
          <h1 className="text-2xl font-bold mt-2">{course.title}</h1>
          <p className="text-gray-500">{course.description}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${
            course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {course.status === 'published' ? 'منشور' : 'مسودة'}
          </span>
        </div>
      </div>

      {/* أزرار الإضافة */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowChapterForm(!showChapterForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          إضافة فصل
        </button>
      </div>

      {/* نموذج إضافة فصل */}
      {showChapterForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-4">إضافة فصل جديد</h3>
          <ChapterForm
            onSubmit={handleCreateChapter}
            onCancel={() => setShowChapterForm(false)}
          />
        </div>
      )}

      {/* قائمة الفصول */}
      {chapters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">لا توجد فصول بعد</p>
          <p className="text-sm text-gray-400">أضف فصلًا أولاً ثم أضف الدروس بداخله</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* رأس الفصل */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center gap-3">
                  <button className="text-gray-500">
                    {expandedChapters.has(chapter.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold">{chapter.title}</h3>
                    <p className="text-sm text-gray-500">
                      {chapter.lessons?.length || 0} دروس
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLessonForm(chapter.id);
                    }}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChapter(chapter);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* الدروس داخل الفصل (موسعة) */}
              {expandedChapters.has(chapter.id) && (
                <div className="border-t p-4 space-y-3">
                  {showLessonForm === chapter.id && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-3">إضافة درس جديد</h4>
                      <LessonForm
                        onSubmit={(data) => handleCreateLesson(chapter.id, data)}
                        onCancel={() => setShowLessonForm(null)}
                      />
                    </div>
                  )}

                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    chapter.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-gray-500">
                              {lesson.video?.type || 'فيديو'} • {lesson.status === 'published' ? 'منشور' : 'مسودة'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/${tenantSlug}/courses/${courseId}/chapters/${chapter.id}/lessons/${lesson.id}/edit`}
                            className="p-2 text-gray-600 hover:bg-white rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                            className="p-2 text-red-600 hover:bg-white rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      لا توجد دروس في هذا الفصل
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
