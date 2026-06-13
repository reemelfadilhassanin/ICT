import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentItem, Submission, Student } from '../types';
import { 
  ArrowRight, BookOpen, Clock, FileText, Search, Send, Award, 
  HelpCircle, ChevronLeft, CheckCircle2, UserCheck, AlertCircle, LogOut 
} from 'lucide-react';
import DocViewer from './DocViewer';

interface StudentDashboardProps {
  gradeLevel: '1st' | '2nd';
  documents: DocumentItem[];
  submissions: Submission[];
  activeStudent: Student | null;
  onSubmitAssignmentSolution: (assignmentId: string, assignmentTitle: string, studentName: string, answerText: string) => void;
  onBackToPortal: () => void;
}

export default function StudentDashboard({
  gradeLevel,
  documents,
  submissions,
  activeStudent,
  onSubmitAssignmentSolution,
  onBackToPortal
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'summaries' | 'assignments' | 'grades'>('summaries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  
  // Submit solution form states
  const [solvingAssignment, setSolvingAssignment] = useState<DocumentItem | null>(null);
  const [studentName, setStudentName] = useState(activeStudent ? activeStudent.name : '');
  const [answerText, setAnswerText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Grade checking states
  const [gradeSearchName, setGradeSearchName] = useState(activeStudent ? activeStudent.name : '');
  const [searchAttempted, setSearchAttempted] = useState(!!activeStudent);

  // Filter documents to ONLY show the ones matching current student grade
  const filteredDocs = (documents || []).filter(doc => {
    if (!doc) return false;
    const matchesGrade = doc.gradeLevel === gradeLevel;
    const matchesSearch = (doc.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                          (doc.description || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                          (doc.unit || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const summariesList = filteredDocs.filter(d => d && d.type === 'summary');
  const assignmentsList = filteredDocs.filter(d => d && d.type === 'assignment');

  const handleSolutionFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingAssignment || !studentName.trim() || !answerText.trim()) return;

    onSubmitAssignmentSolution(
      solvingAssignment.id,
      solvingAssignment.title,
      studentName.trim(),
      answerText.trim()
    );

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setSolvingAssignment(null);
      setStudentName('');
      setAnswerText('');
    }, 2000);
  };

  // Filter submissions by the student's name (strictly locked to the registered activeStudent if logged in!)
  const effectiveSearchName = activeStudent ? activeStudent.name : gradeSearchName;

  const studentSubmissionsHistory = (submissions || []).filter(
    sub => sub && sub.gradeLevel === gradeLevel && (sub.studentName || '').trim().toLowerCase() === (effectiveSearchName || '').trim().toLowerCase()
  );

  // Grade Colors
  const is1stGrade = gradeLevel === '1st';
  const themeColorClass = is1stGrade ? 'emerald' : 'indigo';
  const themeBgColor = is1stGrade ? 'bg-emerald-600' : 'bg-indigo-600';
  const themeTextColor = is1stGrade ? 'text-emerald-700' : 'text-indigo-700';
  const themeBorderColorClass = is1stGrade ? 'border-emerald-500' : 'border-indigo-500';
  const filterHoverBg = is1stGrade ? 'hover:bg-emerald-50' : 'hover:bg-indigo-50';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-4 pb-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      
      {/* Upper Navigation Header bar */}
      <header className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToPortal}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              title="العودة للبوابة الرئيسية"
            >
              <ArrowRight size={20} className="transform rotate-0" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${is1stGrade ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <h2 className="text-lg font-bold text-slate-800">
                  {is1stGrade ? 'بوابة الصف الأول الثانوي ' : 'بوابة الصف الثاني الثانوي'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                مقرر مادة تكنولوجيا المعلومات والاتصالات
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-500 block">أهلاً بك يا متميز:</span>
              <strong className="font-extrabold text-slate-855 block text-xs">
                {activeStudent ? activeStudent.name : 'طالب مسجل'} 👋
              </strong>
            </div>
            <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${is1stGrade ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
              المحتوى مفصول تلقائياً ✔
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav with beautiful cards */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-700 mb-4 border-b border-slate-100 pb-2">قائمة الأقسام</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('summaries'); setSearchQuery(''); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'summaries'
                    ? `${themeBgColor} text-white shadow-md`
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={18} />
                  <span>الملخصات المدرسية</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'summaries' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {summariesList.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('assignments'); setSearchQuery(''); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'assignments'
                    ? `${themeBgColor} text-white shadow-md`
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={18} />
                  <span>الواجبات والتسليمات</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${activeTab === 'assignments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {assignmentsList.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('grades'); setSearchQuery(''); }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === 'grades'
                    ? `${themeBgColor} text-white shadow-md`
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award size={18} />
                  <span>لوحة نتائج واجباتي</span>
                </div>
              </button>
            </div>
          </div>

          {/* Quick study tips card */}
          <div className={`p-5 rounded-2xl border bg-${themeColorClass}-50/40 border-${themeColorClass}-100 text-slate-600`}>
            <div className={`flex items-center gap-2 ${themeTextColor} font-extrabold mb-2 text-sm`}>
              <HelpCircle size={16} />
              <span>تعليمات هامة للاستذكار</span>
            </div>
            <p className="text-[11.5px] leading-relaxed">
              الملخصات المرفوعة مصممة لتبسيط المادة وتغطية الجوانب العملية والبرمجية المقررة بهيكل مرن. ننصحك بقراءتها بانتظام وحل الواجبات لتصل لتقييم الأستاذة ريم ومراجعاتها الفورية.
            </p>
          </div>
        </aside>

        {/* Contents Space */}
        <section className="lg:col-span-3 space-y-6">

          {/* Tab 1: Summaries View */}
          {activeTab === 'summaries' && (
            <div className="space-y-6">
              {/* Filter controls */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                  <Search size={16} className="absolute right-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن ملخص أو محور دراسي..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-50"
                  />
                </div>
                <div className="text-xs text-slate-400 shrink-0 font-medium">
                  تم العثور على {summariesList.length} ملخص
                </div>
              </div>

              {/* Grid of summaries */}
              {summariesList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-sm">لا تتوفر ملخصات دراسية مطابقة لبحثك حالياً.</p>
                  <p className="text-xs mt-1 text-slate-400">تابع مع الأستاذة ريم لرفع المزيد قريباً!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {summariesList.map((doc) => (
                    <motion.div
                      layoutId={`doc-card-${doc.id}`}
                      key={doc.id}
                      className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Summary Header */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${is1stGrade ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'}`}>
                            {doc.unit}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock size={11} />
                            {doc.createdAt}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-800 text-sm md:text-md mb-2 line-clamp-2 leading-snug">
                          {doc.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>

                      {/* Summary Actions */}
                      <div className="flex gap-2 items-center pt-4 border-t border-slate-100 text-xs">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg font-bold text-white transition-all cursor-pointer ${themeBgColor} hover:brightness-110`}
                        >
                          <BookOpen size={14} />
                          <span>فتح المذكرة وتصفحها</span>
                        </button>
                        
                        {doc.fileSize && (
                          <span className="text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md shrink-0">
                            {doc.fileSize}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Assignments View */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                  <Search size={16} className="absolute right-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن واجب أو تكليف هوم ورك..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent bg-slate-50"
                  />
                </div>
                <div className="text-xs text-slate-400 shrink-0 font-medium">
                  {assignmentsList.length} واجبات مكلفة ومتاحة للتلسيم
                </div>
              </div>

              {assignmentsList.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                  <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-sm">لا تتوفر واجبات دراسية مطابقة لبحثك في اللحظة.</p>
                  <p className="text-xs mt-1 text-slate-400">استمتع بوقتك وراجع المذكرات ريثما ترفع الأستاذة ريم الواجب الجديد!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignmentsList.map((asg) => {
                    return (
                      <div key={asg.id} className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">
                              {asg.unit}
                            </span>
                            <h3 className="text-md font-bold text-slate-800 leading-snug">
                              {asg.title}
                            </h3>
                          </div>
                          
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Clock size={12} />
                            تاريخ البدء: {asg.createdAt}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                          {asg.description}
                        </p>

                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 mb-6 space-y-2">
                          <span className="text-xs font-bold text-slate-700 block mb-1">📋 أسئلة التكليف الدراسي:</span>
                          {asg.content.map((question, qIdx) => (
                            <p key={qIdx} className="text-xs text-slate-600 font-medium whitespace-pre-wrap">
                              {question}
                            </p>
                          ))}
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedDoc(asg)}
                            className="text-xs font-bold py-2 p-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          >
                            عرض وقراءة بكامل الصفحة
                          </button>
                          <button
                            onClick={() => {
                              setSolvingAssignment(asg);
                              setStudentName(activeStudent ? activeStudent.name : '');
                              setAnswerText('');
                            }}
                            className={`text-xs font-bold py-2 px-6 rounded-lg text-white transition-colors cursor-pointer ${themeBgColor} hover:brightness-110`}
                          >
                            تسليم وحل الواجب الآن
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Grades Tracker */}
          {activeTab === 'grades' && (
            <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Award className={themeTextColor} size={22} />
                  <span>تتبع حلولي والدرجات المرصودة</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  اكتب اسمك الثلاثي الكامل (كما أدخلته عند حل الواجبات) لرؤية قائمة التكليفات التي قمت بتسليمها والدرجة التي رصدتها لك الأستاذة ريم والتعليقات الخاصة بكل مشاركة.
                </p>
              </div>

              {/* Name search form */}
              <div className="flex flex-col sm:flex-row gap-3 items-end max-w-lg">
                <div className="w-full">
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">اسم الطالب بالكامل:</label>
                  {activeStudent ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={activeStudent.name}
                        disabled
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-650 text-right font-extrabold cursor-not-allowed shadow-3xs"
                      />
                      <span className="absolute left-3 top-3 text-[10px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        حسابك النشط 🔒
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={gradeSearchName}
                      onChange={(e) => {
                        setGradeSearchName(e.target.value);
                        setSearchAttempted(false);
                      }}
                      placeholder="مثال: يوسف أحمد محمود..."
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50 text-right font-medium"
                    />
                  )}
                </div>
                {!activeStudent && (
                  <button
                    onClick={() => setSearchAttempted(true)}
                    className={`py-2.5 px-6 rounded-xl text-white text-sm font-extrabold shrink-0 cursor-pointer ${themeBgColor} hover:brightness-110 transition-all`}
                  >
                    بحث واسترجاع
                  </button>
                )}
              </div>

              {/* Search Result */}
              {searchAttempted && (
                <div className="fade-in pt-4">
                  {studentSubmissionsHistory.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center text-slate-500">
                      <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm font-bold text-slate-700">لم نعثر على أي واجبات باسم: {effectiveSearchName}</p>
                      <p className="text-xs mt-1">تأكد من كتابة الاسم بدقة وبنفس الصياغة التي سلمت بها الواجب، أو قم بحل وتسليم أحد التكليفات أولاً.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <UserCheck size={14} className="text-emerald-600" />
                        <span>تم العثور على <strong>{studentSubmissionsHistory.length}</strong> واجبات تم تسليمها من الطالب: <strong>{effectiveSearchName}</strong></span>
                      </div>
                      
                      {studentSubmissionsHistory.map((sub) => (
                        <div key={sub.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                            <div>
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mb-1">
                                {sub.gradeLevel === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800">{sub.assignmentTitle}</h4>
                            </div>
                            
                            <div className="text-left shrink-0">
                              <span className="text-[10px] text-slate-400 block mb-1">تاريخ التسليم: {sub.submittedAt}</span>
                              {sub.grade ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-550/15 text-emerald-700 rounded-full font-bold text-xs">
                                  <CheckCircle2 size={13} />
                                  الدرجة: {sub.grade}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-550/15 text-amber-700 rounded-full font-bold text-xs">
                                  ⌛ في انتظار التصحيح
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">الرّد والحل الذي أرسلته:</span>
                            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-650 whitespace-pre-wrap border border-slate-200">
                              {sub.answerText}
                            </div>
                          </div>

                          {sub.feedback && (
                            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3.5 text-xs">
                              <span className="font-extrabold text-sky-800 block mb-1">💬 تعليق وتغذية الأستاذة ريم الراجعة:</span>
                              <p className="text-sky-700 font-medium leading-relaxed">{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </section>

      </main>

      {/* PopUp Assignment Solver Modal */}
      {solvingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full border border-slate-200"
          >
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">نموذج تسليم واجب مدرسي تفاعلي</span>
                <h3 className="text-md font-bold text-slate-800">{solvingAssignment.title}</h3>
              </div>
            </div>

            {submitSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-md font-bold text-slate-800">تم إرسال إجابتك بنجاح!</h4>
                <p className="text-xs text-slate-500">تم تسجيل حل الواجب، وستتمكن الأستاذة ريم من مراجعته ورصد الدرجة فوراً.</p>
              </div>
            ) : (
              <form onSubmit={handleSolutionFormSubmit} className="space-y-4 text-right">
                <div>
                  {activeStudent ? (
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-right flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-bold mb-0.5">اسم طالب الحساب الدراسي النشط:</span>
                        <strong className="text-xs text-slate-850 flex items-center gap-1.5 font-extrabold">
                          <UserCheck size={14} className={themeTextColor} />
                          {activeStudent.name}
                        </strong>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${is1stGrade ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        حساب مسجل
                      </span>
                    </div>
                  ) : (
                    <>
                      <label className="text-xs font-bold text-slate-650 block mb-1.5">الاسم الثلاثي للطالب بالكامل:</label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="مثال: يوسف أحمد محمود..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50 text-right font-medium"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">يرجى كتابة الاسم بشكل صحيح لتتمكن من تتبع درجتك وتصحيح الأستاذة ريم لاحقاً.</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">اكتب حل الواجب والأجوبة بالتفصيل:</label>
                  <textarea
                    required
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="اكتب رقم السؤال متبوعاً بالإجابة البرمجية أو المنهجية هنا..."
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-slate-50 text-right font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 text-white text-xs font-bold rounded-lg cursor-pointer ${themeBgColor} hover:brightness-110 transition-colors`}
                  >
                    <Send size={13} />
                    <span>إرسال الحل للأستاذة ريم للمراجعة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolvingAssignment(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    تراجع وإلغاء
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* PDF / Document Reader Embedded Modal */}
      {selectedDoc && (
        <DocViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

    </div>
  );
}
