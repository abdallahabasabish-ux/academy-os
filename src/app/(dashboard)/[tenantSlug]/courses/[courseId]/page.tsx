'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/hooks/useTenant';
import { courseService } from '@/services/course.service';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Video, 
  FileText,
  Users,
  BookOpen,
  Star,
  Clock,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  PlayCircle,
  Award,
  Calendar
} from 'lucide-react';
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
    duration?: number;
    thumbnail?: string;
  };
  settings?: {
    preventForwarding: boolean;
    preventSkipping: boolean;
    requiredWatchTime: number;
    requireCompletion: boolean;
    allowReplay: boolean;
    showSpeedControl: boolean;
    allowFullscreen: boolean;
  };
  createdAt?: any;
  updatedAt?: any;
}

export default function CourseDetailPage({ params }: { params: { tenantSlug: string; courseId: string } }) {
  const { tenantSlug, courseId } = params;
  const { tenant, isLoading: tenantLoading } = useTenant(tenantSlug);
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: any } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // إحصائيات الكورس
  const totalLessons = chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0);
  const publishedLessons = chapters.reduce((acc, ch) => 
    acc + (ch.lessons?.filter(l => l.status === 'published').length || 0), 0
  );
  const publishedChapters = chapters.filter(ch => ch.status === 'published').length;

  useEffect(() => {
    if (tenant) {
      fetchCourseData();
    }
  }, [tenant, courseId]);

  const fetchCourseData = async () => {
    if (!tenant) return;
    try {
      setIsLoading(true);
      setError(null);
      
      const [courseData, chaptersData] = await Promise.all([
        courseService.getCourse(tenant.id, courseId),
        courseService.getChapters(tenant.id, courseId),
      ]);
      
      if (!courseData) {
        setError('الكورس غير موجود');
        return;
      }
      
      setCourse(courseData);
      
      // جلب الدروس لكل فصل
      const chaptersWithLessons = await Promise.all(
        chaptersData.map(async (chapter: any) => {
          const lessons = await courseService.getLessons(tenant.id, courseId, chapter.id);
          return { ...chapter, lessons };
        })
      );
      
      setChapters(chaptersWithLessons);
      
      // توسيع جميع الفصول تلقائياً إذا كان عددها قليلاً
      if (chaptersWithLessons.length <= 3) {
        const allExpanded = new Set(chaptersWithLessons.map(ch => ch.id));
        setExpandedChapters(allExpanded);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('حدث خطأ أثناء تحميل بيانات الكورس');
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

  const expandAll = () => {
    const allExpanded = new Set(chapters.map(ch => ch.id));
    setExpandedChapters(allExpanded);
  };

  const collapseAll = () => {
    setExpandedChapters(new Set());
  };

  const handleCreateChapter = async (data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.createChapter(tenant.id, courseId, data);
      setShowChapterForm(false);
      await fetchCourseData();
    } catch (error) {
      console.error('Error creating chapter:', error);
      setError('حدث خطأ أثناء إنشاء الفصل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateChapter = async (chapterId: string, data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.updateChapter(tenant.id, courseId, chapterId, data);
      setEditingChapter(null);
      await fetchCourseData();
    } catch (error) {
      console.error('Error updating chapter:', error);
      setError('حدث خطأ أثناء تحديث الفصل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الفصل وجميع دروسه؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    if (!tenant) return;
    try {
      await courseService.deleteChapter(tenant.id, courseId, chapterId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setError('حدث خطأ أثناء حذف الفصل');
    }
  };

  const handleCreateLesson = async (chapterId: string, data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.createLesson(tenant.id, courseId, chapterId, data);
      setShowLessonForm(null);
      await fetchCourseData();
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError('حدث خطأ أثناء إنشاء الدرس');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLesson = async (chapterId: string, lessonId: string, data: any) => {
    if (!tenant) return;
    setIsSubmitting(true);
    try {
      await courseService.updateLesson(tenant.id, courseId, chapterId, lessonId, data);
      setEditingLesson(null);
      await fetchCourseData();
    } catch (error) {
      console.error('Error updating lesson:', error);
      setError('حدث خطأ أثناء تحديث الدرس');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    if (!tenant) return;
    try {
      await courseService.deleteLesson(tenant.id, courseId, chapterId, lessonId);
      await fetchCourseData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      setError('حدث خطأ أثناء حذف الدرس');
    }
  };

  const toggleCourseStatus = async () => {
    if (!tenant || !course) return;
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await courseService.updateCourse(tenant.id, courseId, { status: newStatus });
      setCourse({ ...course, status: newStatus });
    } catch (error) {
      console.error('Error updating course status:', error);
      setError('حدث خطأ أثناء تغيير حالة الكورس');
    }
  };

  const getVideoTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      youtube: 'YouTube',
      vimeo: 'Vimeo',
      mp4: 'MP4',
      bunny: 'Bunny.net',
      cloudflare: 'Cloudflare Stream'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">منشور</span>;
    }
    return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">مسودة</span>;
  };

  if (tenantLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">{error || 'الكورس غير موجود'}</div>
        <Link href={`/${tenantSlug}/courses`} className="text-primary hover:underline">
          العودة إلى قائمة الكورسات
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* شريط التنقل */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Link href={`/${tenantSlug}/courses`} className="hover:text-primary transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            الكورسات
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">{course.title}</span>
        </div>
        <Link
          href={`/${tenantSlug}/courses`}
          className="text-sm text-gray-500 hover:text-primary transition"
        >
          العودة للقائمة
        </Link>
      </div>

      {/* رأس الكورس */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold">{course.title}</h1>
              {getStatusBadge(course.status)}
              {course.isFree && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  مجاني
                </span>
              )}
              {!course.isFree && course.price > 0 && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {course.price} ريال
                </span>
              )}
            </div>
            <p className="text-gray-600">{course.description}</p>
            
            {/* إحصائيات سريعة */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{chapters.length} فصول</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Video className="w-4 h-4" />
                <span>{totalLessons} دروس</span>
                <span className="text-gray-300">|</span>
                <span className="text-green-600">{publishedLessons} منشورة</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Users className="w-4 h-4" />
                <span>{course.totalStudents || 0} طالب</span>
              </div>
              {course.duration > 0 && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration} دقيقة</span>
                </div>
              )}
              {course.category && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {course.category}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleCourseStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                course.status === 'published'
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {course.status === 'published' ? (
                <>
                  <XCircle className="w-4 h-4" />
                  إلغاء النشر
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  نشر الكورس
                </>
              )}
            </button>
            <Link
              href={`/${tenantSlug}/courses/${courseId}/preview`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              معاينة
            </Link>
          </div>
        </div>
      </div>

      {/* أزرار الإضافة والتحكم */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowChapterForm(!showChapterForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            إضافة فصل
          </button>
          {chapters.length > 0 && (
            <>
              <button
                onClick={expandAll}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <ChevronDown className="w-4 h-4" />
                توسيع الكل
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition text-sm"
              >
                <ChevronUp className="w-4 h-4" />
                طي الكل
              </button>
            </>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {chapters.length} فصول • {totalLessons} دروس
        </div>
      </div>

      {/* عرض الأخطاء */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* نموذج إضافة فصل */}
      {showChapterForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">إضافة فصل جديد</h3>
            <button
              onClick={() => setShowChapterForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <ChapterForm
            onSubmit={handleCreateChapter}
            isLoading={isSubmitting}
            onCancel={() => setShowChapterForm(false)}
          />
        </div>
      )}

      {/* نموذج تعديل فصل */}
      {editingChapter && (
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">تعديل الفصل</h3>
            <button
              onClick={() => setEditingChapter(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <ChapterForm
            onSubmit={(data) => handleUpdateChapter(editingChapter.id, data)}
            defaultValues={editingChapter}
            isLoading={isSubmitting}
            onCancel={() => setEditingChapter(null)}
          />
        </div>
      )}

      {/* قائمة الفصول */}
      {chapters.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">لا توجد فصول بعد</h3>
          <p className="text-gray-400 text-sm mt-1">أضف فصلًا أولاً ثم أضف الدروس بداخله</p>
          <button
            onClick={() => setShowChapterForm(true)}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4 inline ml-1" />
            إضافة فصل
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
              {/* رأس الفصل */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                    {expandedChapters.has(chapter.id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-400 font-mono flex-shrink-0">#{index + 1}</span>
                      <h3 className="font-semibold truncate">{chapter.title}</h3>
                      {getStatusBadge(chapter.status)}
                    </div>
                    {chapter.description && (
                      <p className="text-sm text-gray-500 truncate">{chapter.description}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {chapter.lessons?.length || 0} دروس
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLessonForm(chapter.id);
                    }}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                    title="إضافة درس"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChapter(chapter);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="تعديل الفصل"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف الفصل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* الدروس داخل الفصل */}
              {expandedChapters.has(chapter.id) && (
                <div className="border-t p-4 space-y-3 bg-gray-50/50">
                  {/* نموذج إضافة درس */}
                  {showLessonForm === chapter.id && (
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">إضافة درس جديد</h4>
                        <button
                          onClick={() => setShowLessonForm(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <LessonForm
                        onSubmit={(data) => handleCreateLesson(chapter.id, data)}
                        isLoading={isSubmitting}
                        onCancel={() => setShowLessonForm(null)}
                      />
                    </div>
                  )}

                  {/* نموذج تعديل درس */}
                  {editingLesson && editingLesson.chapterId === chapter.id && (
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">تعديل الدرس</h4>
                        <button
                          onClick={() => setEditingLesson(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <LessonForm
                        onSubmit={(data) => handleUpdateLesson(chapter.id, editingLesson.lesson.id, data)}
                        defaultValues={editingLesson.lesson}
                        isLoading={isSubmitting}
                        onCancel={() => setEditingLesson(null)}
                      />
                    </div>
                  )}

                  {/* قائمة الدروس */}
                  {chapter.lessons && chapter.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xs text-gray-400 font-mono w-6 flex-shrink-0">{idx + 1}</span>
                            <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{lesson.title}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                <span>{getVideoTypeLabel(lesson.video?.type || 'mp4')}</span>
                                <span>•</span>
                                {getStatusBadge(lesson.status)}
                                {lesson.settings?.requiredWatchTime && (
                                  <>
                                    <span>•</span>
                                    <span>مشاهدة {lesson.settings.requiredWatchTime}%</span>
                                  </>
                                )}
                                {lesson.video?.duration && (
                                  <>
                                    <span>•</span>
                                    <span>{Math.floor(lesson.video.duration / 60)}:{(lesson.video.duration % 60).toString().padStart(2, '0')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingLesson({ chapterId: chapter.id, lesson })}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title="تعديل الدرس"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="حذف الدرس"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                      لا توجد دروس في هذا الفصل
                      <button
                        onClick={() => setShowLessonForm(chapter.id)}
                        className="mr-2 text-primary hover:underline"
                      >
                        أضف درساً الآن
                      </button>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* إحصائيات تفصيلية في الأسفل */}
      {chapters.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="font-semibold mb-4">ملخص المحتوى</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{chapters.length}</p>
              <p className="text-sm text-gray-500">فصول</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-primary">{totalLessons}</p>
              <p className="text-sm text-gray-500">دروس</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{publishedLessons}</p>
              <p className="text-sm text-gray-500">دروس منشورة</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{publishedChapters}</p>
              <p className="text-sm text-gray-500">فصول منشورة</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
