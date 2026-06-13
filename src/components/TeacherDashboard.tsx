import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DocumentItem, Submission, GradeLevel, DocType, Student } from '../types';
import { 
  LogOut, PlusCircle, Trash2, CheckSquare, Award, BookOpen, 
  FileText, Users, Key, CheckCircle, ChevronLeft, Eye, X, Send, UserX, Calendar 
} from 'lucide-react';
import { TEACHER_PASSWORD_DEFAULT } from '../initialData';

interface TeacherDashboardProps {
  documents: DocumentItem[];
  submissions: Submission[];
  students: Student[];
  onAddDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onGradeSubmission: (id: string, grade: string, feedback: string) => void;
  onDeleteSubmission: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onExit: () => void;
}

export default function TeacherDashboard({
  documents,
  submissions,
  students,
  onAddDocument,
  onDeleteDocument,
  onGradeSubmission,
  onDeleteSubmission,
  onDeleteStudent,
  onExit
}: TeacherDashboardProps) {
  // Navigation
  const [activePanel, setActivePanel] = useState<'create' | 'materials' | 'submissions' | 'students' | 'settings'>('create');

  // Form states for creating document
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docGrade, setDocGrade] = useState<GradeLevel>('1st');
  const [docType, setDocType] = useState<DocType>('summary');
  const [docUnit, setDocUnit] = useState('');
  const [docContentLines, setDocContentLines] = useState('');
  const [creationMode, setCreationMode] = useState<'compose' | 'upload_pdf'>('compose');
  const [pdfFileUrl, setPdfFileUrl] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Grading states
  const [gradingItem, setGradingItem] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Custom confirmation modal states to bypass iframe confirm dialog blocking
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docDescription.trim() || !docUnit.trim()) return;

    let contentArray: string[] = [];
    if (creationMode === 'compose') {
      if (!docContentLines.trim()) return;
      contentArray = docContentLines
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else {
      // PDF mode
      if (!pdfFileUrl) {
        setUploadError('يرجى اختيار أو رفع ملف الـ PDF أولاً');
        return;
      }
      contentArray = [
        'تم رفع ملخص تكنولوجيا المعلومات المرفق بصيغة PDF الرقمية المنسقة من طرف الأستاذة ريم جاهزاً للمطالعة والتحميل.',
        'يرجى فتح المرفق بالنقر على زر الطباعة أو التنزيل لتصفح كامل تنسيق المستند الأصلي.'
      ];
    }

    const newDoc: DocumentItem = {
      id: `custom-doc-${Date.now()}`,
      title: docTitle.trim(),
      description: docDescription.trim(),
      gradeLevel: docGrade,
      type: docType,
      unit: docUnit.trim(),
      content: contentArray,
      createdAt: new Date().toISOString().split('T')[0],
      fileSize: `${(Math.random() * (2.8 - 0.9) + 0.9).toFixed(1)} MB`,
      isCustom: true,
      pdfFileUrl: creationMode === 'upload_pdf' ? pdfFileUrl : undefined,
      pdfFileName: creationMode === 'upload_pdf' ? pdfFileName : undefined
    };

    onAddDocument(newDoc);
    setCreateSuccess(true);
    
    // Reset form
    setDocTitle('');
    setDocDescription('');
    setDocUnit('');
    setDocContentLines('');
    setPdfFileUrl('');
    setPdfFileName('');
    setCreationMode('compose');
    setUploadError('');

    setTimeout(() => setCreateSuccess(false), 3000);
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingItem) return;

    onGradeSubmission(gradingItem.id, gradeInput.trim(), feedbackInput.trim());
    setGradingItem(null);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    localStorage.setItem('ict_teacher_password', newPassword.trim());
    setPasswordSuccess(true);
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  // KPIs
  const totalSummaries = (documents || []).filter(d => d && d.type === 'summary').length;
  const totalAssignments = (documents || []).filter(d => d && d.type === 'assignment').length;
  const pendingSubmissionsCount = (submissions || []).filter(s => s && !s.grade).length;
  const gradedSubmissionsCount = (submissions || []).filter(s => s && s.grade).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col py-6 px-4 sm:px-6 lg:px-8" dir="rtl">
      
      {/* Dashboard Top Header */}
      <header className="max-w-7xl mx-auto w-full mb-8">
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-550/25 border border-sky-400/30 text-sky-400 flex items-center justify-center">
              <PlusCircle size={26} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">لوحة تحكم الأستاذة ريم (المعلّمة)</h1>
              <p className="text-xs text-slate-400 mt-1">تكنولوجيا المعلومات والاتصالات - تصفح، تصحيح، وإضافة محتوى</p>
            </div>
          </div>
          
          <button
            onClick={onExit}
            className="px-4 py-2 bg-red-650 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <LogOut size={14} />
            <span>الخروج من لوحة التحكم</span>
          </button>
        </div>
      </header>

      {/* Statistics Cards Row */}
      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Right Dashboard Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-xs font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">خيارات الإدارة</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActivePanel('create')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-extrabold transition-all text-right cursor-pointer ${
                  activePanel === 'create'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>إضافة ملخص أو واجب جديد</span>
                </div>
              </button>

              <button
                onClick={() => setActivePanel('materials')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-extrabold transition-all text-right cursor-pointer ${
                  activePanel === 'materials'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span>إدارة المستندات المرفوعة</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === 'materials' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550'}`}>
                  {documents.length}
                </span>
              </button>

              <button
                onClick={() => setActivePanel('submissions')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-extrabold transition-all text-right cursor-pointer ${
                  activePanel === 'submissions'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>تصحيح تسليمات الطلاب</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  pendingSubmissionsCount > 0 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : (activePanel === 'submissions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550')
                }`}>
                  {pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} غير مصحح` : submissions.length}
                </span>
              </button>

              <button
                onClick={() => setActivePanel('students')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-extrabold transition-all text-right cursor-pointer ${
                  activePanel === 'students'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>دليل الطلاب المسجلين</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activePanel === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550'}`}>
                  {(students || []).length} طالب
                </span>
              </button>

              <button
                onClick={() => setActivePanel('settings')}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-extrabold transition-all text-right cursor-pointer ${
                  activePanel === 'settings'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key size={16} />
                  <span>تغيير رمز المرور الخاص بي</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Info Block representing counts */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
            <h3 className="text-xs font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">إحصاءات سريعة</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-150">
                <span className="text-slate-500 text-[10px] block font-bold">إجمالي التلخيصات</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">{totalSummaries}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-150">
                <span className="text-slate-500 text-[10px] block font-bold">إجمالي الواجبات</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">{totalAssignments}</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl text-center border border-amber-100 lg:col-span-2">
                <span className="text-amber-800 text-[10.5px] block font-extrabold">إجابات بانتظار تصحيحك</span>
                <span className="text-xl font-extrabold text-amber-600 mt-1 block">{pendingSubmissionsCount}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Left Dashboard Panel Content Area */}
        <section className="lg:col-span-3">

          {/* Panel A: Create Content */}
          {activePanel === 'create' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <PlusCircle className="text-sky-600" size={20} />
                  <span>نشر مذكرة دراسية / تكليف منزلي جديد</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  اكتب التفاصيل الخاصة بالمذكرة أو التكليف، ومباشرة سيظهر لطلبة القسم وبقية الفصول ذات الصلة.
                </p>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-6">
                
                {/* Categorization indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1.5">الفئة الدراسية المستهدفة:</label>
                    <select
                      value={docGrade}
                      onChange={(e) => setDocGrade(e.target.value as GradeLevel)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-bold"
                    >
                      <option value="1st">الصف الأول الثانوي (يرى ملخصات الأول فقط)</option>
                      <option value="2nd">الصف الثاني الثانوي (يرى ملخصات الثاني فقط)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1.5">نوع التنزيل والمادة:</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-bold"
                    >
                      <option value="summary">ملخص مذكرة دراسية</option>
                      <option value="assignment">تكليف / واجب منزلي أسئلة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1.5">المحور / الوحدة الدراسية:</label>
                    <input
                      type="text"
                      required
                      value={docUnit}
                      onChange={(e) => setDocUnit(e.target.value)}
                      placeholder="مثال: الوحدة الثانية: لغات الويب وقواعد البيانات"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">عنوان المذكرة أو الواجب الرئيسي:</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="مثال: شرح لغة PHP وطرق الربط بسيرفر MySQL المحلي"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">وصف مبسط للمحتوى:</label>
                  <textarea
                    required
                    rows={2}
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="اكتب لمحة سريعة لتظهر بظهر الكارت لإرشاد الطلاب..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-medium"
                  />
                </div>

                {/* Choose Composing VS PDF Uploading */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-705 block mb-2">طريقة عرض وبناء محتوى المذكرة:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode('compose');
                        setUploadError('');
                      }}
                      className={`p-3 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        creationMode === 'compose'
                          ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-550/25'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>تأليف نصي تفاعلي (HTML)</span>
                      <span className="text-[10px] text-slate-400 font-normal">اكتب نقاط المذكرة يدوياً وتظهر منسقة تلقائياً</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCreationMode('upload_pdf');
                        setUploadError('');
                      }}
                      className={`p-3 rounded-lg border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        creationMode === 'upload_pdf'
                          ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-550/25'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>رفع ملف PDF منسق ومجهز مسبقاً 📌</span>
                      <span className="text-[10px] text-slate-400 font-normal">سيظهر للطالب ملف الـ PDF الأصلي بنفس تصميمك وخطوطك الحالية</span>
                    </button>
                  </div>
                </div>

                {creationMode === 'compose' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-650 block mb-1">المحتوى التعليمي التفصيلي (نقاط دراسية مميزة):</label>
                    <p className="text-[10px] text-slate-400 mb-2">
                      * يرجى كتابة عناصر الدرس أو كود الواجب بحيث تضع كل فكرة أو وسم أو فقرة في **سطر منفصل** ليسهل تنسيقه وعرضه بالتصفح والتحميل المطبوعة.
                    </p>
                    <textarea
                      required
                      rows={8}
                      value={docContentLines}
                      onChange={(e) => setDocContentLines(e.target.value)}
                      placeholder={`اكتب الدرس بالتعداد هنا:\nمثال للسطر الأول:\nتعريف لغة PHP: هي لغة برمجة مفتوحة المصدر لتطوير خلفية المواقع.\nمثال السطر الثاني:\n- عناصر الإدخال مسبوقة بالداش يدركها القارئ الذكي كعنوان جانبي.`}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-mono text-right"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <FileText size={38} className="text-slate-400 mb-2" />
                    
                    {pdfFileUrl ? (
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                          <CheckCircle size={14} />
                          <span>تم تجهيز ملف الـ PDF بنجاح!</span>
                        </div>
                        <p className="text-xs text-slate-705 font-bold">{pdfFileName}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFileUrl('');
                            setPdfFileName('');
                          }}
                          className="text-[11px] text-rose-600 underline font-bold hover:text-rose-500 cursor-pointer"
                        >
                          حذف واختيار ملف آخر
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-slate-700">اختر ملف PDF من جهازك محاكياً للملخص الدراسي المنسق الخاص بك:</p>
                          <p className="text-[10.5px] text-slate-400 mt-1">سيتم حفظ وحفظ التنسيق، وضغطه تزامناً لسهولة سحبه من هاتف التلميذ.</p>
                        </div>
                        
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (file.type !== 'application/pdf') {
                                setUploadError('يرجى كأولوية اختيار مستند PDF فقط لضمان دقة الهوية التنسيقية.');
                                return;
                              }
                              setUploadError('');
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64Url = event.target?.result as string;
                                setPdfFileUrl(base64Url);
                                setPdfFileName(file.name);
                              };
                              reader.readAsDataURL(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <button
                            type="button"
                            className="py-1.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            تصفح الملفات وعثور على ملف PDF 📑
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="mt-3 text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-md border border-rose-200">
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="py-2.5 px-8 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    حفظ ونشر المادة للطلبة الآن 🚀
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Panel B: Materials Management */}
          {activePanel === 'materials' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-md font-bold text-slate-800">إدارة المستندات والملفات المرفوعة</h3>
                <p className="text-xs text-slate-500 mt-1">تضم القائمة كافة المحتويات الافتراضية والجديدة. يمكنك حذف التكليفات الملغاة أو تحديث السجل الدراسي.</p>
              </div>

              {documents.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold">لا تتوفر أي مستندات على الإطلاق حالياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <th className="p-3 font-extrabold rounded-r-lg">العنوان والصف الدراسي</th>
                        <th className="p-3 font-extrabold">الفئة الدراسية</th>
                        <th className="p-3 font-extrabold">المرحلة والمحور الدراسي</th>
                        <th className="p-3 font-extrabold">تاريخ الرفع</th>
                        <th className="p-3 font-extrabold text-center rounded-l-lg">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3">
                            <div className="font-extrabold text-slate-800 leading-snug">{doc.title}</div>
                            <span className="text-[10px] text-slate-400">{doc.description.substring(0, 60)}...</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              doc.type === 'summary' 
                                ? 'bg-emerald-550/15 text-emerald-800' 
                                : 'bg-amber-550/15 text-amber-800'
                            }`}>
                              {doc.type === 'summary' ? 'ملخص دراسي' : 'واجب أسئلة'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                              doc.gradeLevel === '1st' 
                                ? 'bg-sky-100 text-sky-800' 
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {doc.gradeLevel === '1st' ? 'الأول الثانوي' : 'الثاني الثانوي'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-450 text-xs font-mono">{doc.createdAt}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                showConfirm(
                                  'تأكيد حذف المستند الدراسـي',
                                  `هل أنت متأكد من رغبتك في حذف المستند "${doc.title}" نهائياً من قاعدة البيانات السحابية؟ لا يمكن استرجاع هذا الملف بعد حذفه.`,
                                  () => onDeleteDocument(doc.id)
                                );
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-lg transition-colors cursor-pointer"
                              title="حذف المستند نهائياً"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Panel C: Student Submissions with Grading PopUp */}
          {activePanel === 'submissions' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-md font-bold text-slate-800">تصحيح ومراجعة إجابات الطلاب</h3>
                <p className="text-xs text-slate-500 mt-1">تضم هذه اللوحة كافة المحاولات وأجوبة الواجبات المفروزة تزامناً مع ما يرسله الطلبة من حقول التكليفات.</p>
              </div>

              {submissions.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Users size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold">لم يرسل أي تلميذ حله لغاية اللحظة.</p>
                  <p className="text-xs mt-1">عند قيام الطلبة بملء نموذج الواجب، ستتصدى لها هذه اللوحة تفاعلياً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors bg-slate-50/20">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-3 mb-4">
                        <div>
                          <span className="text-xs font-bold text-slate-800">{sub.studentName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              sub.gradeLevel === '1st' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' : 'bg-indigo-50 text-indigo-800 border border-indigo-250'
                            }`}>
                              {sub.gradeLevel === '1st' ? 'الصف الأول' : 'الصف الثاني'}
                            </span>
                            <span className="text-[10.5px] text-slate-500">الواجب: {sub.assignmentTitle}</span>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          <span className="text-[10px] text-slate-400 block mb-1">بتاريخ: {sub.submittedAt}</span>
                          {sub.grade ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-105 text-emerald-800 rounded-full font-bold text-xs">
                              الدرجة المرصودة: {sub.grade}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-105 text-amber-800 rounded-full font-bold text-xs">
                              ⌛ بحاجة للمراجعة ورصد درجة
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-xs font-bold text-slate-650 block mb-1">الرّد المكتوب من الطالب:</span>
                        <div className="bg-white p-3 rounded-lg text-xs leading-relaxed text-slate-800 border border-slate-200 whitespace-pre-wrap font-mono select-text">
                          {sub.answerText}
                        </div>
                      </div>

                      {sub.feedback && (
                        <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs">
                          <span className="font-bold text-sky-800 block mb-1">الرأي والتصحيح الذي أرسلته:</span>
                          <p className="text-sky-700 leading-relaxed font-medium">{sub.feedback}</p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setGradingItem(sub);
                            setGradeInput(sub.grade || '');
                            setFeedbackInput(sub.feedback || '');
                          }}
                          className="py-1.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>{sub.grade ? 'تعديل الدرجة / التعليق' : 'تصحيح ورصد التقييم'}</span>
                        </button>
                        <button
                          onClick={() => {
                            showConfirm(
                              'تأكيد مسح إجابة الطالب',
                              `هل أنت متأكد تماماً من رغبتك في مسح إجابة الطالب "${sub.studentName}" وتصحيحه نهائياً؟`,
                              () => onDeleteSubmission(sub.id)
                            );
                          }}
                          className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          حذف الإجابة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Panel: Registered Students Database Management */}
          {activePanel === 'students' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Users className="text-sky-600" size={20} />
                  <span>دليل ومتابعة الطلاب المسجلين</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">تصفح قائمة الطلاب المسجلين في داتا بيز المنصة للصفين الأول والثاني الثانوي ومراقبة تقدمهم الدراسي.</p>
              </div>

              {(!students || students.length === 0) ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
                  <Users className="mx-auto text-slate-350 mb-2" size={36} />
                  <p className="text-sm font-bold text-slate-700">داتا بيز الطلاب فارغة حالياً</p>
                  <p className="text-xs mt-1">سيظهر الطلاب في هذا الدليل بمجرد قيامهم بتسجيل الدخول أو بإنشاء حساباتهم الشخصية بالمنصة.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-right text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-4">اسم الطالب الثلاثي</th>
                        <th className="p-4 text-center">الصف الدراسي</th>
                        <th className="p-4 text-center">تاريخ التسجيل</th>
                        <th className="p-4 text-center">الواجبات المسلّمة</th>
                        <th className="p-4 text-center">إجراءات الحساب</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => {
                        const studentSubmissionsCount = (submissions || []).filter(
                          s => s.studentName.trim().toLowerCase() === student.name.trim().toLowerCase()
                        ).length;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-800">{student.name}</td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                student.gradeLevel === '1st' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {student.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
                              </span>
                            </td>
                            <td className="p-4 text-center text-slate-500 font-medium">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {student.registeredAt}
                              </span>
                            </td>
                            <td className="p-4 text-center font-bold text-slate-705">
                              {studentSubmissionsCount > 0 ? (
                                <span className="inline-block bg-sky-50 text-sky-800 border border-sky-100 font-extrabold px-2 py-0.5 rounded-md">
                                  {studentSubmissionsCount} واجب(ات)
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic">لم يسلّم بعد</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => {
                                  showConfirm(
                                    'تأكيد حذف الحساب الدراسي',
                                    `هل أنت متأكد من رغبتك في حذف حساب الطالب "${student.name}" نهائياً من قاعدة البيانات السحابية؟ سينهي هذا جلسته الحالية ويحذف معلوماته.`,
                                    () => onDeleteStudent(student.id)
                                  );
                                }}
                                className="inline-flex items-center gap-1 py-1.5 px-3 bg-white hover:bg-red-50 text-red-650 border border-slate-200 hover:border-red-200 rounded-lg text-[10px] font-extrabold transition-colors cursor-pointer"
                              >
                                <UserX size={12} />
                                <span>حذف الطالب</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Panel D: Settings (Change Password) */}
          {activePanel === 'settings' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                  <Key className="text-sky-600" size={20} />
                  <span>إعدادات الخصوصية وتغيير كلمة السر</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">تأمين لوحة الأستاذة ريم وحمايتها بتغيير رمز الدخول الخاص بكِ.</p>
              </div>

              {passwordSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-xs text-emerald-800">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                  <div>
                    <strong>تم الحفظ بنجاح!</strong> تم تعديل الرقم السري المعتمد لولوج الأستاذة بنجاح. يرجى تذكره لعمليات الدخول القادمة.
                  </div>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">كلمة مرور الأستاذة ريم الجديدة:</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="اكتب الرقم السري القوي الجديد هنا..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 text-center font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  حفظ وتطبيق الكلمة الجديدة
                </button>
              </form>
            </div>
          )}

        </section>

      </main>

      {/* Grading / correction PopUp Modal */}
      {gradingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full border border-slate-200"
          >
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">تصحيح وحقيبة تقدير كراسة حل تلميذ</span>
                <h3 className="text-md font-bold text-slate-800">الطالب: {gradingItem.studentName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">التكليف: {gradingItem.assignmentTitle}</p>
              </div>
              <button 
                onClick={() => setGradingItem(null)}
                className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-right">
              
              <div>
                <span className="text-xs font-bold text-slate-650 block mb-1.5">إجابة الطالب للمراجعة:</span>
                <div className="bg-slate-55 p-3 rounded-lg text-xs text-slate-800 max-h-40 overflow-y-auto border border-slate-200 font-mono select-text whitespace-pre-wrap">
                  {gradingItem.answerText}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">الدرجة أو تقدير الواجب:</label>
                  <input
                    type="text"
                    required
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="مثال: 10/10 أو ممتاز جداً..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-650 block mb-1.5">ملاحظات وتوجيه الأستاذة ريم:</label>
                  <input
                    type="text"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="مثال: أحسنت كتابة الكود البرمجي..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send size={12} />
                  <span>تأكيد ورصد الدرجة والتغذية</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGradingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  إلغاء المراجعة
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Deletion Confirmation Dialog Overlay for Safe Frame Operations */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 text-right"
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-lg shrink-0">
                <Trash2 size={24} />
              </div>
              <h3 className="text-md font-extrabold text-slate-800">{confirmModal.title}</h3>
            </div>
            
            <p className="text-xs text-slate-600 font-bold mb-5 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer shadow-sm active:scale-98"
              >
                تأكيد الحذف النهائي
              </button>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                تراجع وإلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
