import React, { useState, useEffect } from 'react';
import { DocumentItem, Submission, Student } from './types';
import { INITIAL_DOCUMENTS } from './initialData';
import WelcomePortal from './components/WelcomePortal';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

// Firebase imports
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export default function App() {
  const [currentView, setCurrentView] = useState<'portal' | '1st' | '2nd' | 'teacher'>('portal');

  // Realtime synced states from Firestore
  const [students, setStudents] = useState<Student[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Current active logged in student (kept in localStorage so they don't lose session on reload)
  const [activeStudent, setActiveStudent] = useState<Student | null>(() => {
    const savedActive = localStorage.getItem('ict_active_student');
    if (savedActive) {
      try {
        return JSON.parse(savedActive);
      } catch (e) {
        console.error('Error parsing active student from localStorage', e);
      }
    }
    return null;
  });

  // -------------------------------------------------------------
  // 1. One-time database seeding if database is empty on launch
  // -------------------------------------------------------------
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        // Read documents from Firestore
        const docSnap = await getDocs(collection(db, 'documents'));
        if (docSnap.empty) {
          console.log('Seeding initial documents into Firestore...');
          for (const d of INITIAL_DOCUMENTS) {
            await setDoc(doc(db, 'documents', d.id), d);
          }
        }
        
        // Read students from Firestore
        const studentSnap = await getDocs(collection(db, 'students'));
        if (studentSnap.empty) {
          console.log('Seeding initial students into Firestore...');
          const initialStudents = [
            { id: 'student-seed-1', name: 'أحمد محمد علي', gradeLevel: '1st', registeredAt: '22-06-2026' },
            { id: 'student-seed-2', name: 'سارة يوسف ياسين', gradeLevel: '2nd', registeredAt: '23-06-2026' }
          ];
          for (const s of initialStudents) {
            await setDoc(doc(db, 'students', s.id), s);
          }
        }

        // Read submissions from Firestore
        const subSnap = await getDocs(collection(db, 'submissions'));
        if (subSnap.empty) {
          console.log('Seeding initial submissions into Firestore...');
          const initialSubmissions = [
            {
              id: 'seed-sub-1',
              assignmentId: 'asg-1-1',
              assignmentTitle: 'واجب: مقارنة تفصيلية بين نظامي التشغيل Windows و Android',
              studentName: 'أحمد محمد علي',
              gradeLevel: '1st',
              submittedAt: '2026-06-11',
              answerText: 'إجابة السؤال الأول:\nنظام التشغيل وندوز هو نظام مغلق المصدر تطوره شركة مايكروسوفت وهو مخصص للحواسيب المكتبية والمحمولة، أما نظام أندرويد فهو نظام مفتوح المصدر تعود نواته للينكس وتطوره جوجل/تحالف الهواتف الذكية ومخصص بالأساس للهواتف والأجهزة اللوحية.\n\nإجابة السؤال الثاني:\nاستخدام برامج مفتوحة المصدر مثل Audacity و GIMP يحمي المدارس من تكاليف شراء التراخيص غالية الثمن ويوفر للتلاميذ برمجيات مجانية ومفتوحة آمنة تماماً.',
              grade: '10/10',
              feedback: 'ممتاز يا أحمد! إجابتك نموذجية ومصاغة بأسلوب تقني رائع يدل على تميزك وفهمك للفرق بين تراخيص المصادر.'
            },
            {
              id: 'seed-sub-2',
              assignmentId: 'asg-2-1',
              assignmentTitle: 'واجب: كتابة كود هيكل HTML لنموذج تسجيل دخول تفاعلي لطلاب الثانوية',
              studentName: 'سارة يوسف ياسين',
              gradeLevel: '2nd',
              submittedAt: '2026-06-12',
              answerText: '<form action="login.php" method="POST">\n  <label>الاسم الرقمي:</label>\n  <input type="text" name="student_user" required />\n\n  <label>كلمة السر:</label>\n  <input type="password" name="student_pass" required />\n\n  <input type="submit" value="تسجيل الدخول للمنصة" />\n</form>',
              grade: undefined,
              feedback: undefined
            }
          ];
          for (const sub of initialSubmissions) {
            const cleanSub = Object.fromEntries(
              Object.entries(sub).filter(([_, v]) => v !== undefined)
            );
            await setDoc(doc(db, 'submissions', sub.id), cleanSub);
          }
        }
      } catch (err) {
        console.error('Error seeding/verifying Firestore database:', err);
      }
    };
    checkAndSeed();
  }, []);

  // -------------------------------------------------------------
  // 2. Realtime sync loaders from Firestore
  // -------------------------------------------------------------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const list: Student[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Student);
      });
      setStudents(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const list: DocumentItem[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as DocumentItem);
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setDocuments(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      const list: Submission[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Submission);
      });
      list.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
      setSubmissions(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });
    return () => unsub();
  }, []);

  // Persistence of activeStudent session
  useEffect(() => {
    if (activeStudent) {
      localStorage.setItem('ict_active_student', JSON.stringify(activeStudent));
    } else {
      localStorage.removeItem('ict_active_student');
    }
  }, [activeStudent]);

  // -------------------------------------------------------------
  // 3. User operations & data synchronization handlers
  // -------------------------------------------------------------
  const handleRegisterStudent = (name: string, gradeLevel: '1st' | '2nd') => {
    const trimmedName = name.trim();
    // Check if name already exists
    const existing = students.find(
      s => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      setActiveStudent(existing);
      setCurrentView(existing.gradeLevel);
      return existing;
    }

    const newId = `student-${Date.now()}`;
    const newStudent: Student = {
      id: newId,
      name: trimmedName,
      gradeLevel,
      registeredAt: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
    };

    setDoc(doc(db, 'students', newId), newStudent).catch((error) => {
      handleFirestoreError(error, OperationType.CREATE, `students/${newId}`);
    });

    setActiveStudent(newStudent);
    setCurrentView(gradeLevel);
    return newStudent;
  };

  const handleLoginStudent = (name: string): { success: boolean; student?: Student; error?: string } => {
    const trimmedName = name.trim();
    const found = students.find(
      s => s.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (found) {
      setActiveStudent(found);
      setCurrentView(found.gradeLevel);
      return { success: true, student: found };
    }
    return { success: false, error: 'هذا الاسم غير مسجل لدينا، يرجى كتابة اسمك بدقة أو النقر على "تسجيل حساب طالب جديد" لتسجيل اسمك بالمنصة لأول مرة.' };
  };

  const handleLogoutStudent = () => {
    setActiveStudent(null);
    setCurrentView('portal');
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      if (activeStudent && activeStudent.id === id) {
        setActiveStudent(null);
        setCurrentView('portal');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const handleAddDocument = async (newDoc: DocumentItem) => {
    try {
      const cleanDoc = Object.fromEntries(
        Object.entries(newDoc).filter(([_, v]) => v !== undefined)
      );
      await setDoc(doc(db, 'documents', newDoc.id), cleanDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `documents/${newDoc.id}`);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `documents/${id}`);
    }
  };

  const handleAddSubmission = async (assignmentId: string, assignmentTitle: string, studentName: string, answerText: string) => {
    const newId = `submission-${Date.now()}`;
    const newSub: Submission = {
      id: newId,
      assignmentId,
      assignmentTitle,
      studentName,
      gradeLevel: activeStudent ? activeStudent.gradeLevel : (currentView === '1st' ? '1st' : '2nd'),
      submittedAt: new Date().toISOString().split('T')[0],
      answerText
    };
    try {
      await setDoc(doc(db, 'submissions', newId), newSub);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `submissions/${newId}`);
    }
  };

  const handleGradeSubmission = async (id: string, grade: string, feedback: string) => {
    const existingSub = submissions.find(s => s.id === id);
    if (!existingSub) return;
    
    const updatedSub: Submission = {
      ...existingSub,
      grade,
      feedback
    };
    
    try {
      await setDoc(doc(db, 'submissions', id), updatedSub);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${id}`);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'submissions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `submissions/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300">
      {currentView === 'portal' && (
        <WelcomePortal
          students={students}
          onRegisterStudent={handleRegisterStudent}
          onLoginStudent={handleLoginStudent}
          onEnterTeacher={() => setCurrentView('teacher')}
        />
      )}

      {(currentView === '1st' || currentView === '2nd') && (
        <StudentDashboard
          gradeLevel={currentView}
          documents={documents}
          submissions={submissions}
          activeStudent={activeStudent}
          onSubmitAssignmentSolution={handleAddSubmission}
          onBackToPortal={handleLogoutStudent}
        />
      )}

      {currentView === 'teacher' && (
        <TeacherDashboard
          documents={documents}
          submissions={submissions}
          students={students}
          onAddDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
          onGradeSubmission={handleGradeSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onDeleteStudent={handleDeleteStudent}
          onExit={() => setCurrentView('portal')}
        />
      )}
    </div>
  );
}
