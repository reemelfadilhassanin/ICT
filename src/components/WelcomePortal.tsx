import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, FileSpreadsheet, Lock, Laptop, CheckCircle, GraduationCap, ChevronLeft, ArrowLeftRight, UserCheck, AlertCircle, PlusCircle } from 'lucide-react';
import { TEACHER_PASSWORD_DEFAULT } from '../initialData';
import { Student } from '../types';

interface WelcomePortalProps {
  students: Student[];
  onRegisterStudent: (name: string, gradeLevel: '1st' | '2nd') => Student;
  onLoginStudent: (name: string) => { success: boolean; student?: Student; error?: string };
  onEnterTeacher: () => void;
}

export default function WelcomePortal({ students, onRegisterStudent, onLoginStudent, onEnterTeacher }: WelcomePortalProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Student registration and login states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentModalGrade, setStudentModalGrade] = useState<'1st' | '2nd'>('1st');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentActionTab, setStudentActionTab] = useState<'register' | 'login'>('register');
  const [studentError, setStudentError] = useState('');

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('ict_teacher_password') || TEACHER_PASSWORD_DEFAULT;
    if (password === storedPass) {
      setError('');
      setShowPasswordModal(false);
      onEnterTeacher();
    } else {
      setError('رمز المرور الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleStudentActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    const name = studentNameInput.trim();
    if (!name) {
      setStudentError('يرجى إدخال اسم الطالب بالكامل.');
      return;
    }

    if (name.length < 5) {
      setStudentError('يرجى إدخال الاسم الثلاثي الكامل (يجب أن لا يقل عن 5 أحرف لتسهيل المتابعة).');
      return;
    }

    if (studentActionTab === 'register') {
      const exists = students.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        setStudentError(`هذا الاسم مسجل مسبقاً في الصف ${exists.gradeLevel === '1st' ? 'الأول' : 'الثاني'} الثانوي. يرجى اختيار التبويب الآخر للدخول السريع.`);
        return;
      }
      onRegisterStudent(name, studentModalGrade);
      setShowStudentModal(false);
      setStudentNameInput('');
    } else {
      const res = onLoginStudent(name);
      if (res.success) {
        setShowStudentModal(false);
        setStudentNameInput('');
      } else {
        setStudentError(res.error || '');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Decorative background elements with very soft, comfortable colors */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-100/15 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-100/15 rounded-full blur-3xl -z-10 translate-x-1/2 translate-y-1/2" />
      
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center animate-fade-in"
        >
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-teal-50 text-teal-800 font-bold text-xs mb-4 border border-teal-100 shadow-sm">
            <GraduationCap size={16} className="text-teal-600" />
            <span>منصة الأستاذة ريم الرقمية التفاعلية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-normal drop-shadow-xs">
            تكنولوجيا المعلومات والاتصالات
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl font-medium leading-relaxed">
            مرحباً بكم في الموقع الرسمي للمادة. توجد هنا جميع الملخصات الدراسية المعتمدة والواجبات المنزلية الأسبوعية مصنفة بشكل مستقل لكل صف دراسي.
          </p>
        </motion.div>
      </header>

      {/* Main Grid Options */}
      <main className="max-w-5xl mx-auto w-full my-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* First Secondary Card (1st Secondary Grade) */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onClick={() => {
              setStudentModalGrade('1st');
              setStudentActionTab('register');
              setStudentNameInput('');
              setStudentError('');
              setShowStudentModal(true);
            }}
            className="group cursor-pointer bg-white rounded-2xl p-8 shadow-md hover:shadow-xl border border-slate-200 hover:border-teal-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden active:scale-98"
          >
            {/* Background design layer */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50/50 rounded-bl-full -z-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="mb-6">
              <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xs border border-teal-100/50">
                <BookOpen size={26} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 group-hover:text-teal-700 transition-colors duration-300">
                الصف الأول الثانوي
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                اضغط هنا لتصفح وقراءة الملخصات وحل تكليفات وواجبات الصف الأول بشكل مبسط ومنظم ومريح للعين.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-teal-650 font-bold text-xs">
              <span>انضم للصف الأول الثانوي</span>
              <ChevronLeft size={16} className="transform group-hover:-translate-x-1 transition-transform duration-350" />
            </div>
          </motion.div>

          {/* Second Secondary Card (2nd Secondary Grade) */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onClick={() => {
              setStudentModalGrade('2nd');
              setStudentActionTab('register');
              setStudentNameInput('');
              setStudentError('');
              setShowStudentModal(true);
            }}
            className="group cursor-pointer bg-white rounded-2xl p-8 shadow-md hover:shadow-xl border border-slate-200 hover:border-sky-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden active:scale-98"
          >
            {/* Background design layer */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50/50 rounded-bl-full -z-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
            
            <div className="mb-6">
              <div className="w-14 h-14 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xs border border-sky-100/50">
                <Laptop size={26} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 group-hover:text-sky-700 transition-colors duration-300">
                الصف الثاني الثانوي
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                انقر للدخول إلى البوابة الرقمية للصف الثاني ومتابعة الدروس المرفوعة وتوجيهات الأستاذة ريم الأسبوعية.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-sky-650 font-bold text-xs">
              <span>انضم للصف الثاني الثانوي</span>
              <ChevronLeft size={16} className="transform group-hover:-translate-x-1 transition-transform duration-350" />
            </div>
          </motion.div>

        </div>

        {/* Info Highlights */}
        <div className="mt-12 bg-white/70 backdrop-blur-xs rounded-xl p-4 border border-slate-200/60 text-slate-500 text-xs text-center leading-relaxed font-medium shadow-3xs max-w-3xl mx-auto">
          🔒 تتميز هذه المنصة بالفصل الكامل للمحتوى الدراسي، حيث لا يظهر لطالب الصف الثاني معلومات التكليف الخاصة بالصف الأول والعكس تماماً، للترشيد الأكاديمي ومنع تشتت الفكر.
        </div>
      </main>

      {/* Footer & Teacher Button */}
      <footer className="max-w-7xl mx-auto w-full text-center mt-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-bold transition-all duration-200 shadow-sm border border-slate-700 cursor-pointer"
          >
            <Lock size={13} />
            <span>لوحة تحكم الأستاذة (المعلمة)</span>
          </button>
          
          <div className="text-[10px] text-slate-400">
            جميع الحقوق محفوظة لمنصة مادة تكنولوجيا المعلومات والاتصالات &copy; 2026/2027
          </div>
        </div>
      </footer>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-950 mb-2">الدخول الآمن للأستاذة ريم</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              من فضلكِ أدخلي رمز المرور السري المعتمد الخاص بكِ كأستاذة للتمكن من رفع الملخصات وتصحيح واجبات الطلاب والطالبات.
            </p>
            
            <form onSubmit={handleTeacherSubmit}>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رقم المرور السري..."
                  className="w-full px-4 py-2 border border-slate-250 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-center font-bold"
                  required
                  autoFocus
                />

                {error && (
                  <p className="text-red-500 text-xs mt-2 text-right font-bold">
                    {error}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  تحقق ودخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Student Registration & Login Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full border border-slate-205"
          >
            {/* Modal Colored Bar Header */}
            <div className={`p-5 text-white ${
              studentModalGrade === '1st' 
                ? 'bg-gradient-to-r from-teal-700 to-teal-650' 
                : 'bg-gradient-to-r from-sky-700 to-sky-650'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold">بوابة الطلاب الرقمية</h3>
                  <p className="text-xs text-white/80 mt-1">
                    مقرر تكنولوجيا المعلومات والاتصالات - {studentModalGrade === '1st' ? 'الصف الأول الثانوي' : 'الصف الثاني الثانوي'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Form Option Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100/75 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setStudentActionTab('register');
                    setStudentError('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    studentActionTab === 'register'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <PlusCircle size={14} className={studentActionTab === 'register' ? 'text-teal-600' : 'text-slate-400'} />
                  <span>تسجيل طالب جديد</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentActionTab('login');
                    setStudentError('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    studentActionTab === 'login'
                      ? 'bg-white text-slate-800 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck size={14} className={studentActionTab === 'login' ? 'text-teal-600' : 'text-slate-400'} />
                  <span>دخول طالب مسجل</span>
                </button>
              </div>

              <form onSubmit={handleStudentActionSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    {studentActionTab === 'register' ? 'اسم الطالب الكامل (أدخل اسمك الثلاثي بدقة لسهولة مراجعة تفاعلاتك):' : 'أدخل اسمك المسجل مسبقاً بالكامل:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={studentNameInput}
                    onChange={(e) => {
                      setStudentNameInput(e.target.value);
                      if (studentError) setStudentError('');
                    }}
                    placeholder="مثال: أحمد محمد علي..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/80 bg-slate-50 font-bold transition-all"
                    autoFocus
                  />
                </div>

                {studentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex gap-2 items-start font-bold leading-relaxed shadow-3xs" dir="rtl">
                    <AlertCircle className="shrink-0 mt-0.5" size={14} />
                    <span>{studentError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 py-2.5 px-4 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 ${
                      studentModalGrade === '1st'
                        ? 'bg-teal-600 hover:bg-teal-700 active:scale-98'
                        : 'bg-indigo-650 hover:bg-indigo-700 active:scale-98'
                    }`}
                  >
                    <span>{studentActionTab === 'register' ? 'تسجيل وحفظ معلوماتي' : 'تسجيل دخول للمنصة'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudentModal(false);
                      setStudentNameInput('');
                      setStudentError('');
                    }}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
